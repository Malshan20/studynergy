"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  ArrowRight, 
  Trophy, 
  Zap, 
  RotateCcw, 
  Home,
  CheckCircle2,
  XCircle,
  Car,
  Timer,
  Target,
  FileText,
  Gamepad2,
  BookOpen,
  Clock,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  GameQuestion, 
  convertQuizToGameQuestions, 
  getMockQuestions,
  getRandomQuestions 
} from "@/lib/gameAdapter"
import { loadGamificationState, recordGameSession, GamificationState } from "@/lib/gamification"
import { saveGameResult, SaveGameResult } from "@/lib/gameClient"
import { createClient } from "@/lib/supabase/client"

interface DocumentItem {
  id: string
  title: string
  created_at: string
  quizCount: number
  examCount: number
}

// Document Selection Screen
function DocumentSelector({ onSelect, onPlayDemo }: { 
  onSelect: (docId: string, source: "quiz" | "exam") => void
  onPlayDemo: () => void
}) {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDocuments() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Get all documents
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title, created_at, study_set_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      
      if (!docs || docs.length === 0) { setLoading(false); return }

      // For each doc, check quiz and exam counts
      const items: DocumentItem[] = []
      for (const doc of docs) {
        // Quiz count
        const { data: quizzes } = await supabase
          .from("quizzes")
          .select("id")
          .eq("document_id", doc.id)
        
        let quizQuestionCount = 0
        if (quizzes && quizzes.length > 0) {
          const { count } = await supabase
            .from("quiz_questions")
            .select("id", { count: "exact", head: true })
            .eq("quiz_id", quizzes[0].id)
          quizQuestionCount = count || 0
        }

        // Exam count via study_set
        let examQuestionCount = 0
        if (doc.study_set_id) {
          const { data: exams } = await supabase
            .from("mock_exams")
            .select("id")
            .eq("study_set_id", doc.study_set_id)
          
          if (exams && exams.length > 0) {
            const { count } = await supabase
              .from("mock_exam_questions")
              .select("id", { count: "exact", head: true })
              .eq("exam_id", exams[0].id)
            examQuestionCount = count || 0
          }
        }

        items.push({
          id: doc.id,
          title: doc.title,
          created_at: doc.created_at,
          quizCount: quizQuestionCount,
          examCount: examQuestionCount,
        })
      }
      
      setDocuments(items.filter(d => d.quizCount > 0 || d.examCount > 0))
      setLoading(false)
    }
    loadDocuments()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your study materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Game Mode</h1>
            <p className="text-sm text-muted-foreground">Pick a study material to play</p>
          </div>
        </div>

        {/* Document List */}
        <div className="mt-6 space-y-3">
          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Study Materials Yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Upload a document and generate quizzes first, then come back to play!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard">
                  <Button className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Create Study Materials
                  </Button>
                </Link>
                <Button variant="outline" onClick={onPlayDemo} className="gap-2 bg-transparent">
                  <Gamepad2 className="w-4 h-4" />
                  Play Demo Instead
                </Button>
              </div>
            </motion.div>
          ) : (
            <>
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border/50 bg-card overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      {doc.quizCount > 0 && (
                        <button
                          onClick={() => onSelect(doc.id, "quiz")}
                          className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Quiz</span>
                            <span className="text-xs text-muted-foreground">{doc.quizCount} Qs</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                      {doc.examCount > 0 && (
                        <button
                          onClick={() => onSelect(doc.id, "exam")}
                          className="flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group"
                        >
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Exam</span>
                            <span className="text-xs text-muted-foreground">{doc.examCount} Qs</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="pt-4 border-t border-border/50">
                <Button variant="ghost" onClick={onPlayDemo} className="w-full gap-2 text-muted-foreground">
                  <Gamepad2 className="w-4 h-4" />
                  Play with Demo Questions
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Game Content
function GamePlayContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialDocId = searchParams.get("doc")
  const initialSource = searchParams.get("source") as "quiz" | "exam" | null

  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialDocId)
  const [selectedSource, setSelectedSource] = useState<"quiz" | "exam">(initialSource || "quiz")
  const [gameState, setGameState] = useState<"select" | "loading" | "ready" | "playing" | "ended">(
    initialDocId ? "loading" : "select"
  )
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedLane, setSelectedLane] = useState(1)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null)
  const [carSpeed, setCarSpeed] = useState(1)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gamificationState, setGamificationState] = useState<GamificationState | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [docTitle, setDocTitle] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null) // Declare selectedDoc variable

  // Load questions for a selected document
  const loadQuestions = useCallback(async (docId: string | null, source: "quiz" | "exam") => {
    setGameState("loading")
    setGamificationState(loadGamificationState())
    
    if (!docId) {
      setQuestions(getMockQuestions())
      setDocTitle("Demo Questions")
      setGameState("ready")
      return
    }

    try {
      const supabase = createClient()

      if (source === "quiz") {
        const { data: quizzes } = await supabase
          .from("quizzes")
          .select("id")
          .eq("document_id", docId)
          .limit(1)

        if (quizzes && quizzes.length > 0) {
          const { data: quizQuestions } = await supabase
            .from("quiz_questions")
            .select("question, options, correct_answer")
            .eq("quiz_id", quizzes[0].id)

          if (quizQuestions && quizQuestions.length > 0) {
            setQuestions(getRandomQuestions(convertQuizToGameQuestions(quizQuestions), 15))
          }
        }
      } else {
        // Load exam questions
        const { data: doc } = await supabase
          .from("documents")
          .select("study_set_id")
          .eq("id", docId)
          .single()

        if (doc?.study_set_id) {
          const { data: exams } = await supabase
            .from("mock_exams")
            .select("id")
            .eq("study_set_id", doc.study_set_id)
            .limit(1)

          if (exams && exams.length > 0) {
            const { data: examQuestions } = await supabase
              .from("mock_exam_questions")
              .select("question, options, correct_answer")
              .eq("exam_id", exams[0].id)

            if (examQuestions && examQuestions.length > 0) {
              setQuestions(getRandomQuestions(convertQuizToGameQuestions(examQuestions), 15))
            }
          }
        }
      }

      // Get doc title
      const { data: docData } = await supabase
        .from("documents")
        .select("title")
        .eq("id", docId)
        .single()
      if (docData) setDocTitle(docData.title)

      // Get selected doc
      const { data: selectedDocData } = await supabase
        .from("documents")
        .select("id")
        .eq("id", docId)
        .single()
      setSelectedDoc(selectedDocData)

    } catch (e) {
      console.error("Failed to load questions:", e)
    }

    setGameState((prev) => {
      // If no questions were loaded, fall back to mock
      return "ready"
    })
  }, [])

  // Load on initial doc param
  useEffect(() => {
    if (initialDocId) {
      loadQuestions(initialDocId, selectedSource)
    }
    setGamificationState(loadGamificationState())
  }, [initialDocId, selectedSource, loadQuestions])

  // Ensure questions are ready
  useEffect(() => {
    if (gameState === "ready" && questions.length === 0) {
      setQuestions(getMockQuestions())
      setDocTitle("Demo Questions")
    }
  }, [gameState, questions.length])

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1) // Force wrong on timeout
          return 10
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState, currentIndex])

  // Keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (gameState !== "playing") return
      if (e.key === "ArrowLeft") setSelectedLane((p) => Math.max(0, p - 1))
      else if (e.key === "ArrowRight") setSelectedLane((p) => Math.min(3, p + 1))
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleAnswer(selectedLane) }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState, selectedLane, currentIndex])

  const handleAnswer = useCallback((lane: number) => {
    if (showResult) return
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return
    const isCorrect = lane === currentQuestion.correctIndex
    setShowResult(isCorrect ? "correct" : "wrong")
    if (isCorrect) {
      setScore((p) => p + 100 + timeLeft * 10)
      setCorrectCount((p) => p + 1)
      setCarSpeed((p) => Math.min(p + 0.2, 2))
      setXpGained((p) => p + 10)
    } else {
      setCarSpeed((p) => Math.max(p - 0.3, 0.5))
    }
    setTimeout(() => {
      setShowResult(null)
      setSelectedLane(1)
      setTimeLeft(10)
      if (currentIndex >= questions.length - 1) {
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount
        const finalXP = xpGained + (isCorrect ? 10 : 0) + (finalCorrect === questions.length ? 50 : 0)
        setXpGained(finalXP)
        if (gamificationState) {
          const newState = recordGameSession(gamificationState, finalCorrect, questions.length)
          setGamificationState(newState)
        }
        // Save to Supabase
        saveGameResult({
          gameMode: "quiz-runner",
          documentId: selectedDoc?.id || null,
          score: finalXP,
          correct: finalCorrect,
          total: questions.length,
        })
        setGameState("ended")
      } else {
        setCurrentIndex((p) => p + 1)
      }
    }, 1000)
  }, [currentIndex, questions, showResult, timeLeft, correctCount, xpGained, gamificationState])

  const startGame = () => {
    setGameState("playing")
    setCurrentIndex(0)
    setScore(0)
    setCorrectCount(0)
    setSelectedLane(1)
    setCarSpeed(1)
    setTimeLeft(10)
    setXpGained(0)
  }

  const restartGame = () => {
    setQuestions(getRandomQuestions(questions, 15))
    startGame()
  }

  const handleSelectDocument = (docId: string, source: "quiz" | "exam") => {
    setSelectedDocId(docId)
    setSelectedSource(source)
    loadQuestions(docId, source)
  }

  const handlePlayDemo = () => {
    setSelectedDocId(null)
    loadQuestions(null, "quiz")
  }

  const goBackToSelect = () => {
    setGameState("select")
    setQuestions([])
    setSelectedDocId(null)
    setDocTitle("")
  }

  // === DOCUMENT SELECTION ===
  if (gameState === "select") {
    return <DocumentSelector onSelect={handleSelectDocument} onPlayDemo={handlePlayDemo} />
  }

  // === LOADING ===
  if (gameState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    )
  }

  // === READY ===
  if (gameState === "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card to-secondary/20 border border-border/50 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
            <Car className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-black mb-1">Quiz Runner</h1>
          {docTitle && (
            <p className="text-sm font-medium text-primary mb-1 line-clamp-1">{docTitle}</p>
          )}
          <p className="text-muted-foreground text-sm mb-6">
            Steer your car into the correct answer lane!
          </p>
          
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-2xl font-bold text-primary">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-2xl font-bold text-amber-500">10s</p>
              <p className="text-xs text-muted-foreground">Per Question</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50">
              <p className="text-2xl font-bold text-green-500">+10</p>
              <p className="text-xs text-muted-foreground">XP/Correct</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-6 text-left px-2">
            <p className="text-sm font-medium">Controls:</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">{'<'}-</kbd>
              <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">-{'>'}</kbd>
              <span>Move lanes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">Space</kbd>
              <span>Confirm / Tap lane on mobile</span>
            </div>
          </div>
          
          <Button
            onClick={startGame}
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80"
          >
            Start Game
          </Button>
          
          <Button variant="ghost" className="mt-3 w-full" onClick={goBackToSelect}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Pick Different Material
          </Button>
        </motion.div>
      </div>
    )
  }

  // === ENDED ===
  if (gameState === "ended") {
    const accuracy = Math.round((correctCount / questions.length) * 100)
    const isPerfect = correctCount === questions.length
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card to-secondary/20 border border-border/50 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isPerfect
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : accuracy >= 70
                ? "bg-gradient-to-br from-green-400 to-green-600"
                : "bg-gradient-to-br from-blue-400 to-blue-600"
            }`}
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-black mb-1">
            {isPerfect ? "Perfect!" : accuracy >= 70 ? "Great Job!" : "Keep Practicing!"}
          </h1>
          {docTitle && <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{docTitle}</p>}
          
          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-2xl font-black text-primary">{score.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-2xl font-black text-green-500">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-2xl font-black">{correctCount}/{questions.length}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-2xl font-black text-amber-500">+{xpGained}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={restartGame}
              size="lg"
              className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button variant="outline" className="w-full h-12 rounded-xl bg-transparent" onClick={goBackToSelect}>
              <Gamepad2 className="w-4 h-4 mr-2" />
              Pick Different Material
            </Button>
            <Link href="/dashboard" className="block">
              <Button variant="ghost" className="w-full h-12 rounded-xl">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // === PLAYING ===
  const currentQuestion = questions[currentIndex]
  if (!currentQuestion) return null
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* HUD */}
      <div className="p-3 sm:p-4 flex items-center justify-between bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={goBackToSelect} className="text-white/70 hover:text-white p-1.5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-white">{currentIndex + 1}/{questions.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/20">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">{score.toLocaleString()}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${
            timeLeft <= 3 ? "bg-red-500/20" : "bg-white/10"
          }`}>
            <Timer className={`w-3.5 h-3.5 ${timeLeft <= 3 ? "text-red-500" : "text-white"}`} />
            <span className={`text-xs font-bold ${timeLeft <= 3 ? "text-red-500" : "text-white"}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>
      
      {/* Question */}
      <div className="px-4 pt-4 sm:pt-6">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center"
        >
          <p className="text-base sm:text-lg font-bold text-white leading-snug">{currentQuestion.question}</p>
        </motion.div>
      </div>
      
      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Road markings */}
        <motion.div
          animate={{ y: [0, 100] }}
          transition={{ duration: 0.5 / carSpeed, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute left-1/2 -translate-x-1/2 w-1.5 h-6 bg-white/20 rounded-full" style={{ top: `${i * 10}%` }} />
          ))}
        </motion.div>
        
        {/* Car */}
        <motion.div
          animate={{ x: `${(selectedLane - 1.5) * 25}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-10"
        >
          <div className={`w-10 h-14 sm:w-14 sm:h-18 rounded-lg flex items-center justify-center shadow-lg ${
            showResult === "correct" ? "bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30"
              : showResult === "wrong" ? "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
              : "bg-gradient-to-br from-primary to-primary/70 shadow-primary/30"
          }`}>
            <Car className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </motion.div>

        {/* Answer feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20"
            >
              {showResult === "correct" ? (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/90 text-white font-bold text-sm shadow-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  +{100 + timeLeft * 10}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/90 text-white font-bold text-sm shadow-lg">
                  <XCircle className="w-5 h-5" />
                  Wrong!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Answer lanes */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 px-3 sm:px-4">
          <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={`${currentIndex}-${index}`}
                onClick={() => { setSelectedLane(index); handleAnswer(index) }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                  showResult
                    ? index === currentQuestion.correctIndex
                      ? "bg-green-500/30 border-green-500"
                      : selectedLane === index && showResult === "wrong"
                      ? "bg-red-500/30 border-red-500"
                      : "bg-white/5 border-white/10"
                    : selectedLane === index
                    ? "bg-primary/30 border-primary"
                    : "bg-white/5 border-white/10 active:bg-white/10"
                }`}
              >
                <span className={`text-xs sm:text-sm font-medium leading-tight line-clamp-2 ${
                  showResult
                    ? index === currentQuestion.correctIndex ? "text-green-400"
                      : selectedLane === index && showResult === "wrong" ? "text-red-400" : "text-white/40"
                    : selectedLane === index ? "text-white" : "text-white/70"
                }`}>{option}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GamePlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <GamePlayContent />
    </Suspense>
  )
}
