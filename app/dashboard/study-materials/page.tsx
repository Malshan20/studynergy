"use client"

import React from "react"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Layers,
  FileText,
  BookCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Loader2,
  Clock,
  BookOpen,
  Trophy,
  Target,
  Flame,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Document {
  id: string
  title: string
  created_at: string
  study_set_id: string | null
}

interface Flashcard {
  id: string
  front: string
  back: string
}

interface Summary {
  id: string
  content: string
}

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: string
}

interface ExamQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: string
  points: number
}

export default function StudyMaterialsPage() {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [documentTitle, setDocumentTitle] = useState("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([])
  const [materialLoading, setMaterialLoading] = useState(false)

  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [showExamResults, setShowExamResults] = useState(false)

  useEffect(() => {
    async function loadDocuments() {
      const supabase = createClient()
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        setLoading(false)
        return
      }

      const { data: docs } = await supabase
        .from("documents")
        .select("id, title, created_at, study_set_id")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })

      if (docs && docs.length > 0) {
        setDocuments(docs)
        setSelectedDoc(docs[0].id)
      }
      setLoading(false)
    }
    loadDocuments()
  }, [])

  const loadMaterials = useCallback(async () => {
    if (!selectedDoc) return
    setMaterialLoading(true)

    const supabase = createClient()

    setFlashcards([])
    setSummary(null)
    setQuizQuestions([])
    setExamQuestions([])
    setFlippedCards(new Set())
    setCurrentFlashcard(0)
    setQuizAnswers({})
    setExamAnswers({})
    setShowQuizResults(false)
    setShowExamResults(false)

    const doc = documents.find((d) => d.id === selectedDoc)
    if (doc) setDocumentTitle(doc.title)

    // Fetch all materials in parallel
    const [cardsRes, sumRes, quizRes] = await Promise.all([
      supabase
        .from("flashcards")
        .select("id, front, back")
        .eq("document_id", selectedDoc)
        .order("created_at", { ascending: true }),
      supabase
        .from("summaries")
        .select("id, content")
        .eq("document_id", selectedDoc)
        .single(),
      supabase
        .from("quizzes")
        .select("id")
        .eq("document_id", selectedDoc)
        .single(),
    ])

    if (cardsRes.data) setFlashcards(cardsRes.data)
    if (sumRes.data) setSummary(sumRes.data)

    // Fetch quiz questions
    if (quizRes.data) {
      const { data: questions } = await supabase
        .from("quiz_questions")
        .select("id, question, options, correct_answer")
        .eq("quiz_id", quizRes.data.id)
        .order("created_at", { ascending: true })
      if (questions) setQuizQuestions(questions)
    }

    // Fetch mock exam questions via study_set_id from the document
    const studySetId = doc?.study_set_id
    if (studySetId) {
      const { data: exam } = await supabase
        .from("mock_exams")
        .select("id")
        .eq("study_set_id", studySetId)
        .single()

      if (exam) {
        const { data: examQs } = await supabase
          .from("mock_exam_questions")
          .select("id, question, options, correct_answer, points")
          .eq("exam_id", exam.id)
          .order("created_at", { ascending: true })
        if (examQs) setExamQuestions(examQs)
      }
    }

    setMaterialLoading(false)
  }, [selectedDoc, documents])

  useEffect(() => {
    loadMaterials()
  }, [loadMaterials])

  const toggleFlip = (index: number) => {
    const newFlipped = new Set(flippedCards)
    if (newFlipped.has(index)) newFlipped.delete(index)
    else newFlipped.add(index)
    setFlippedCards(newFlipped)
  }

  const nextFlashcard = () => {
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length)
    setFlippedCards(new Set())
  }
  const prevFlashcard = () => {
    setCurrentFlashcard((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setFlippedCards(new Set())
  }

  const handleQuizAnswer = (qi: number, ai: number) => {
    if (showQuizResults) return
    setQuizAnswers((prev) => ({ ...prev, [qi]: ai }))
  }
  const handleExamAnswer = (qi: number, ai: number) => {
    if (showExamResults) return
    setExamAnswers((prev) => ({ ...prev, [qi]: ai }))
  }

  const calcScore = (answers: Record<number, number>, questions: { options: string[]; correct_answer: string }[]) => {
    let correct = 0
    Object.entries(answers).forEach(([i, a]) => {
      const q = questions[Number(i)]
      if (q && q.options[a] === q.correct_answer) correct++
    })
    return { correct, total: questions.length, pct: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0 }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading study materials...</p>
        </motion.div>
      </div>
    )
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">No Study Materials Yet</h1>
          <p className="text-muted-foreground mb-6">Upload your first document and let AI create flashcards, summaries, quizzes, and mock exams for you.</p>
          <Link href="/dashboard">
            <Button className="rounded-full px-8 h-12">
              <Sparkles className="w-4 h-4 mr-2" />
              Create Study Materials
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const quizScore = calcScore(quizAnswers, quizQuestions)
  const examScore = calcScore(examAnswers, examQuestions)

  // Question card renderer
  const renderQuestion = (
    question: { id: string; question: string; options: string[]; correct_answer: string },
    qIndex: number,
    answers: Record<number, number>,
    handleAnswer: (qi: number, ai: number) => void,
    showResults: boolean,
    type: "quiz" | "exam"
  ) => {
    const isEssay = !question.options || question.options.length === 0 || (question.options.length === 1 && question.options[0] === "Essay answer required")

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: qIndex * 0.03 }}
        className="bg-card border border-border/50 rounded-2xl overflow-hidden"
      >
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {qIndex + 1}
            </div>
            <p className="font-medium text-base leading-relaxed pt-1">{question.question}</p>
          </div>

          {isEssay ? (
            <div className="ml-11">
              <div className="bg-secondary/30 rounded-xl p-4 border border-dashed border-border">
                <p className="text-sm text-muted-foreground italic">This is an essay question. Write your answer in your own words.</p>
                <textarea
                  className="w-full mt-3 bg-background rounded-lg p-3 border border-border/50 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Type your answer here..."
                />
              </div>
            </div>
          ) : (
            <div className="ml-11 space-y-2">
              {question.options.map((option, oIndex) => {
                const isSelected = answers[qIndex] === oIndex
                const isCorrect = option === question.correct_answer
                const showResult = showResults

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(qIndex, oIndex)}
                    disabled={showResults}
                    className={`w-full text-left p-4 rounded-xl border transition-all group ${
                      showResult
                        ? isCorrect
                          ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                          : isSelected
                            ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
                            : "bg-card border-border/50 opacity-60"
                        : isSelected
                          ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20"
                          : "bg-card border-border/50 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          showResult
                            ? isCorrect
                              ? "border-green-500 bg-green-500 text-white"
                              : isSelected
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-border"
                            : isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border group-hover:border-primary/50"
                        }`}
                      >
                        {showResult && isCorrect ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : showResult && isSelected && !isCorrect ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          String.fromCharCode(65 + oIndex)
                        )}
                      </div>
                      <span className="text-sm leading-relaxed">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Study Materials</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden rounded-full bg-transparent"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Docs
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Mobile overlay + Desktop fixed */}
          <AnimatePresence>
            {(sidebarOpen || true) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`lg:col-span-3 ${sidebarOpen ? "fixed inset-0 z-40 lg:relative lg:z-0" : "hidden lg:block"}`}
              >
                {/* Mobile overlay backdrop */}
                {sidebarOpen && (
                  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}
                <div
                  className={`${
                    sidebarOpen
                      ? "fixed left-0 top-0 bottom-0 w-80 z-50 lg:relative lg:w-auto"
                      : ""
                  } bg-card border border-border/50 rounded-2xl p-4 lg:sticky lg:top-20`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Documents
                    </h2>
                    {sidebarOpen && (
                      <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[calc(100vh-200px)] lg:h-[calc(100vh-180px)]">
                    <div className="space-y-2 pr-2">
                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoc(doc.id)
                            setSidebarOpen(false)
                          }}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedDoc === doc.id
                              ? "bg-primary/10 border-primary/30 shadow-sm"
                              : "bg-card border-border/50 hover:border-primary/20 hover:bg-secondary/30"
                          }`}
                        >
                          <h3 className="font-medium text-sm mb-1.5 line-clamp-2">{doc.title}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.created_at)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-9">
            {materialLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                {/* Document Header */}
                <div className="px-4 md:px-6 pt-5 pb-4 border-b border-border/50">
                  <h2 className="text-lg md:text-xl font-bold mb-2 text-balance">{documentTitle}</h2>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="gap-1.5">
                      <Layers className="w-3 h-3" />
                      {flashcards.length} Flashcards
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5">
                      <FileText className="w-3 h-3" />
                      Summary
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5">
                      <BookCheck className="w-3 h-3" />
                      {quizQuestions.length} Quiz Qs
                    </Badge>
                    <Badge variant="secondary" className="gap-1.5">
                      <GraduationCap className="w-3 h-3" />
                      {examQuestions.length} Exam Qs
                    </Badge>
                  </div>
                </div>

                <Tabs defaultValue="flashcards" className="w-full">
                  <div className="px-4 md:px-6 pt-4 overflow-x-auto">
                    <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-4 h-auto gap-1.5 bg-secondary/30 p-1.5 rounded-xl">
                      <TabsTrigger value="flashcards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-4 text-sm flex items-center gap-2 whitespace-nowrap">
                        <Layers className="w-4 h-4" />
                        Flashcards
                      </TabsTrigger>
                      <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-4 text-sm flex items-center gap-2 whitespace-nowrap">
                        <FileText className="w-4 h-4" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="quiz" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-4 text-sm flex items-center gap-2 whitespace-nowrap">
                        <BookCheck className="w-4 h-4" />
                        Quiz
                      </TabsTrigger>
                      <TabsTrigger value="exam" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-2.5 px-4 text-sm flex items-center gap-2 whitespace-nowrap">
                        <GraduationCap className="w-4 h-4" />
                        Exam
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* ===== FLASHCARDS ===== */}
                  <TabsContent value="flashcards" className="p-4 md:p-6">
                    {flashcards.length > 0 ? (
                      <div className="max-w-2xl mx-auto">
                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-1.5 mb-6">
                          {flashcards.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => { setCurrentFlashcard(i); setFlippedCards(new Set()) }}
                              className={`w-2 h-2 rounded-full transition-all ${
                                i === currentFlashcard ? "bg-primary w-6" : "bg-border hover:bg-primary/40"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Card */}
                        <motion.div
                          key={currentFlashcard}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => toggleFlip(currentFlashcard)}
                          className="relative h-64 sm:h-72 md:h-80 cursor-pointer perspective-1000"
                        >
                          <AnimatePresence mode="wait">
                            {!flippedCards.has(currentFlashcard) ? (
                              <motion.div
                                key="front"
                                initial={{ rotateY: 180, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -180, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-2 border-primary/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-lg"
                              >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                  <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-lg md:text-xl font-semibold leading-relaxed">{flashcards[currentFlashcard].front}</p>
                                <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">Tap to reveal</p>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="back"
                                initial={{ rotateY: -180, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: 180, opacity: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-br from-accent/10 via-card to-primary/10 border-2 border-accent/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-lg"
                              >
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                  <CheckCircle2 className="w-5 h-5 text-accent" />
                                </div>
                                <p className="text-lg md:text-xl font-semibold leading-relaxed">{flashcards[currentFlashcard].back}</p>
                                <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">Tap to see question</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6">
                          <Button variant="outline" onClick={prevFlashcard} className="rounded-full gap-2 bg-transparent">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Previous</span>
                          </Button>
                          <span className="text-sm font-medium text-muted-foreground">
                            {currentFlashcard + 1} / {flashcards.length}
                          </span>
                          <Button variant="outline" onClick={nextFlashcard} className="rounded-full gap-2 bg-transparent">
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <EmptyTab icon={Layers} label="flashcards" />
                    )}
                  </TabsContent>

                  {/* ===== SUMMARY ===== */}
                  <TabsContent value="summary" className="p-4 md:p-6">
                    {summary ? (
                      <div className="max-w-3xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">AI Summary</h3>
                                <p className="text-xs text-muted-foreground">Generated from your document</p>
                              </div>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <p className="text-foreground/90 leading-7 whitespace-pre-wrap">{summary.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <EmptyTab icon={FileText} label="summary" />
                    )}
                  </TabsContent>

                  {/* ===== QUIZ ===== */}
                  <TabsContent value="quiz" className="p-4 md:p-6">
                    {quizQuestions.length > 0 ? (
                      <div className="max-w-3xl mx-auto space-y-4">
                        {/* Score Card */}
                        {showQuizResults && (
                          <ScoreCard
                            score={quizScore}
                            onReset={() => { setQuizAnswers({}); setShowQuizResults(false) }}
                            type="Quiz"
                          />
                        )}

                        {/* Progress bar */}
                        {!showQuizResults && (
                          <div className="bg-card border border-border/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-muted-foreground">{Object.keys(quizAnswers).length}/{quizQuestions.length}</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(Object.keys(quizAnswers).length / quizQuestions.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}

                        {quizQuestions.map((q, i) => renderQuestion(q, i, quizAnswers, handleQuizAnswer, showQuizResults, "quiz"))}

                        {!showQuizResults && Object.keys(quizAnswers).length === quizQuestions.length && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Button onClick={() => setShowQuizResults(true)} className="w-full rounded-xl h-14 text-base font-semibold">
                              <Target className="w-5 h-5 mr-2" />
                              Submit Quiz
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <EmptyTab icon={BookCheck} label="quiz questions" />
                    )}
                  </TabsContent>

                  {/* ===== MOCK EXAM ===== */}
                  <TabsContent value="exam" className="p-4 md:p-6">
                    {examQuestions.length > 0 ? (
                      <div className="max-w-3xl mx-auto space-y-4">
                        {/* Score Card */}
                        {showExamResults && (
                          <ScoreCard
                            score={examScore}
                            onReset={() => { setExamAnswers({}); setShowExamResults(false) }}
                            type="Mock Exam"
                          />
                        )}

                        {/* Progress bar */}
                        {!showExamResults && (
                          <div className="bg-card border border-border/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-muted-foreground">{Object.keys(examAnswers).length}/{examQuestions.length}</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(Object.keys(examAnswers).length / examQuestions.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}

                        {examQuestions.map((q, i) => renderQuestion(q, i, examAnswers, handleExamAnswer, showExamResults, "exam"))}

                        {!showExamResults && Object.keys(examAnswers).length === examQuestions.length && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Button onClick={() => setShowExamResults(true)} className="w-full rounded-xl h-14 text-base font-semibold">
                              <GraduationCap className="w-5 h-5 mr-2" />
                              Submit Exam
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <EmptyTab icon={GraduationCap} label="exam questions" />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Score Card component
function ScoreCard({ score, onReset, type }: { score: { correct: number; total: number; pct: number }; onReset: () => void; type: string }) {
  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: "Excellent!", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" }
    if (pct >= 70) return { label: "Great Job!", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" }
    if (pct >= 50) return { label: "Not Bad!", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" }
    return { label: "Keep Trying!", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" }
  }
  const grade = getGrade(score.pct)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`${grade.bg} border ${grade.border} rounded-2xl p-6 md:p-8 text-center`}>
      <div className="flex justify-center mb-4">
        <div className={`w-16 h-16 rounded-full ${grade.bg} flex items-center justify-center`}>
          <Trophy className={`w-8 h-8 ${grade.color}`} />
        </div>
      </div>
      <h3 className={`text-3xl font-bold mb-1 ${grade.color}`}>{score.pct}%</h3>
      <p className="text-lg font-semibold mb-1">{grade.label}</p>
      <p className="text-sm text-muted-foreground mb-6">{score.correct} out of {score.total} correct on {type}</p>
      <Button onClick={onReset} variant="outline" className="rounded-full gap-2 bg-transparent">
        <RotateCcw className="w-4 h-4" />
        Try Again
      </Button>
    </motion.div>
  )
}

// Empty tab component
function EmptyTab({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium">No {label} available</p>
      <p className="text-sm text-muted-foreground/60 mt-1">Generate new materials from the dashboard</p>
    </div>
  )
}
