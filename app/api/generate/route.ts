import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Direct Groq API call with JSON mode
async function callGroq(prompt: string, maxTokens = 1500): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that ONLY outputs valid JSON. Never include any text before or after the JSON object. No markdown, no explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: "json_object" }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.log("[v0] Groq API error:", errorText)

    // If rate limited, parse retry-after and wait
    if (response.status === 429) {
      let waitMs = 35000 // default 35s
      try {
        const errJson = JSON.parse(errorText)
        const msg: string = errJson?.error?.message || ""
        const match = msg.match(/try again in ([0-9.]+)s/)
        if (match) waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 1000
      } catch { /* ignore */ }
      console.log(`[v0] Rate limited. Waiting ${waitMs}ms before retry...`)
      await delay(waitMs)
      throw new Error(`RATE_LIMITED`) // signal caller to retry once
    }

    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
}

// callGroq with one automatic retry on rate limit
async function callGroqWithRetry(prompt: string, maxTokens = 1500): Promise<string> {
  try {
    return await callGroq(prompt, maxTokens)
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      console.log("[v0] Retrying after rate limit wait...")
      return await callGroq(prompt, maxTokens)
    }
    throw e
  }
}

// Safe JSON parse
function safeParseJSON(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text)
  } catch {
    console.log("[v0] JSON parse failed for:", text.substring(0, 300))
    return null
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, options } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const flashcardCount = options?.flashcardCount || 8
    const quizCount = options?.quizCount || 6
    const examCount = options?.examCount || 8
    const examType = options?.examType || "mcq"

    // Tighter content limits to stay well under TPM
    const truncatedContent = content.substring(0, 1800)
    const shortContent = content.substring(0, 600)

    console.log("[v0] Starting generation for:", title, "Content length:", truncatedContent.length)

    // Create study set
    const { data: studySet, error: studySetError } = await supabase
      .from("study_sets")
      .insert({
        user_id: user.id,
        title: title,
        description: `AI-generated study materials for: ${title}`,
      })
      .select()
      .maybeSingle()

    if (studySetError || !studySet) {
      console.log("[v0] Study set error:", studySetError)
      return NextResponse.json({ error: "Failed to create study set" }, { status: 500 })
    }

    // Create document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        study_set_id: studySet.id,
        title: title,
        file_url: `data:text/plain;base64,${Buffer.from(truncatedContent).toString('base64')}`,
        file_type: "text/plain",
        file_size: truncatedContent.length,
        processing_status: "processing",
      })
      .select()
      .maybeSingle()

    if (docError || !document) {
      console.log("[v0] Document error:", docError)
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
    }

    const flashcards: Array<{ question: string; answer: string }> = []
    let summaryContent = ""
    const quizQuestions: Array<{ question: string; options: string[]; correctAnswer: number }> = []
    const examQuestions: Array<{ question: string; options: string[]; correctAnswer: number }> = []

    // ── 1. Flashcards ──────────────────────────────────────────────────
    console.log("[v0] Generating", flashcardCount, "flashcards...")
    try {
      const rawResponse = await callGroqWithRetry(
        `Create ${flashcardCount} flashcards about "${title}".
Content: ${shortContent}
Return JSON: {"flashcards":[{"front":"question","back":"answer"}]}`,
        1200
      )

      console.log("[v0] Flashcard response:", rawResponse.substring(0, 200))
      const data = safeParseJSON(rawResponse)

      if (data?.flashcards && Array.isArray(data.flashcards)) {
        for (const fc of data.flashcards as Array<{ front?: string; back?: string }>) {
          if (fc.front && fc.back) flashcards.push({ question: fc.front, answer: fc.back })
        }
        if (flashcards.length > 0) {
          await supabase.from("flashcards").insert(
            flashcards.map((fc) => ({
              user_id: user.id,
              document_id: document.id,
              study_set_id: studySet.id,
              front: fc.question,
              back: fc.answer,
            }))
          )
          console.log("[v0] Saved", flashcards.length, "flashcards")
        }
      }
    } catch (e) {
      console.log("[v0] Flashcard error:", e instanceof Error ? e.message : e)
    }

    // Wait 12s between calls to let the TPM window breathe
    console.log("[v0] Waiting before summary...")
    await delay(12000)

    // ── 2. Summary ─────────────────────────────────────────────────────
    console.log("[v0] Generating summary...")
    try {
      const rawResponse = await callGroqWithRetry(
        `Write a concise study summary paragraph for "${title}".
Content: ${shortContent}
Return JSON: {"summary":"your summary text here"}`,
        800
      )

      console.log("[v0] Summary response:", rawResponse.substring(0, 200))
      const data = safeParseJSON(rawResponse)

      if (data?.summary && typeof data.summary === "string") {
        summaryContent = data.summary
        await supabase.from("summaries").insert({
          user_id: user.id,
          document_id: document.id,
          content: summaryContent,
        })
        console.log("[v0] Saved summary")
      }
    } catch (e) {
      console.log("[v0] Summary error:", e instanceof Error ? e.message : e)
    }

    await delay(12000)
    console.log("[v0] Waiting before quiz...")

    // ── 3. Quiz ────────────────────────────────────────────────────────
    console.log("[v0] Generating", quizCount, "quiz questions...")
    try {
      const rawResponse = await callGroqWithRetry(
        `Create ${quizCount} MCQ quiz questions about "${title}".
Content: ${shortContent}
Return JSON: {"questions":[{"question":"text","options":["A","B","C","D"],"correct":0}]}
"correct" is the 0-based index of the right answer.`,
        1200
      )

      console.log("[v0] Quiz response:", rawResponse.substring(0, 200))
      const data = safeParseJSON(rawResponse)

      if (data?.questions && Array.isArray(data.questions)) {
        const { data: quiz } = await supabase
          .from("quizzes")
          .insert({
            user_id: user.id,
            document_id: document.id,
            study_set_id: studySet.id,
            title: `Quiz: ${title}`,
          })
          .select()
          .maybeSingle()

        if (quiz) {
          const toInsert = []
          for (const q of data.questions as Array<{ question?: string; options?: string[]; correct?: number }>) {
            if (q.question && Array.isArray(q.options)) {
              const idx = typeof q.correct === "number" ? q.correct : 0
              quizQuestions.push({ question: q.question, options: q.options, correctAnswer: idx })
              toInsert.push({
                quiz_id: quiz.id,
                question: q.question,
                options: q.options,
                correct_answer: q.options[idx] || q.options[0],
              })
            }
          }
          if (toInsert.length > 0) {
            await supabase.from("quiz_questions").insert(toInsert)
            console.log("[v0] Saved", toInsert.length, "quiz questions")
          }
        }
      }
    } catch (e) {
      console.log("[v0] Quiz error:", e instanceof Error ? e.message : e)
    }

    await delay(12000)
    console.log("[v0] Waiting before exam...")

    // ── 4. Mock Exam ───────────────────────────────────────────────────
    console.log("[v0] Generating", examCount, examType, "exam questions...")
    try {
      const rawResponse = await callGroqWithRetry(
        `Create ${examCount} MCQ exam questions about "${title}".
Content: ${shortContent}
Return JSON: {"questions":[{"question":"text","options":["A","B","C","D"],"correct":0}]}
Each question must have exactly 4 options. "correct" is index 0-3.`,
        1400
      )

      console.log("[v0] Exam response:", rawResponse.substring(0, 200))
      const data = safeParseJSON(rawResponse)

      if (data?.questions && Array.isArray(data.questions)) {
        const { data: exam } = await supabase
          .from("mock_exams")
          .insert({
            user_id: user.id,
            study_set_id: studySet.id,
            title: `Mock Exam: ${title}`,
            duration_minutes: 30,
          })
          .select()
          .maybeSingle()

        if (exam) {
          const toInsert = []
          for (const q of data.questions as Array<{ question?: string; options?: string[] | null; correct?: number }>) {
            if (q.question && Array.isArray(q.options) && q.options.length >= 2) {
              const opts = q.options.map((o) => String(o))
              const idx = typeof q.correct === "number" && q.correct >= 0 && q.correct < opts.length ? q.correct : 0
              examQuestions.push({ question: q.question, options: opts, correctAnswer: idx })
              toInsert.push({
                exam_id: exam.id,
                question: q.question,
                options: opts,
                correct_answer: opts[idx],
                points: 10,
              })
            }
          }
          if (toInsert.length > 0) {
            await supabase.from("mock_exam_questions").insert(toInsert)
            console.log("[v0] Saved", toInsert.length, "exam questions")
          }
        }
      }
    } catch (e) {
      console.log("[v0] Exam error:", e instanceof Error ? e.message : e)
    }

    // Update document status
    await supabase.from("documents").update({ processing_status: "completed" }).eq("id", document.id)

    console.log("[v0] DONE! Flashcards:", flashcards.length, "Summary:", summaryContent.length > 0, "Quiz:", quizQuestions.length, "Exam:", examQuestions.length)

    return NextResponse.json({
      success: true,
      studySetId: studySet.id,
      documentId: document.id,
      flashcards,
      summary: { content: summaryContent, keyPoints: [] },
      quiz: quizQuestions,
      mockExam: examQuestions,
      hasExam: examQuestions.length > 0,
    })
  } catch (error) {
    console.log("[v0] Fatal error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}