import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase()
    let text = ""

    if (fileExt === "txt" || fileExt === "md") {
      text = await file.text()
    } else if (fileExt === "pdf") {
      const arrayBuffer = await file.arrayBuffer()

      // Use unpdf for modern ESM-compatible PDF text extraction
      const { extractText, getDocumentProxy } = await import("unpdf")
      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))
      const { text: extractedText } = await extractText(pdf, { mergePages: true })

      text = extractedText

      if (text.trim().length < 50) {
        return NextResponse.json(
          {
            error:
              "Could not extract text from this PDF. It may be image-based or scanned. Please copy and paste the text manually.",
            partial: text,
          },
          { status: 422 }
        )
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please use PDF, TXT, or MD files." },
        { status: 400 }
      )
    }

    // Normalise whitespace
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim()

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Text extraction error:", error)
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    )
  }
}
