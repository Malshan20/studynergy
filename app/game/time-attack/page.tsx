"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Trophy, Zap, RotateCcw, Home, CheckCircle2, XCircle,
  Clock, Target, Gamepad2, Flame, Timer, ChevronRight, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { GameQuestion, convertQuizToGameQuestions, getMockQuestions, getRandomQuestions } from "@/lib/gameAdapter"
import { loadGamificationState, recordGameSession, GamificationState } from "@/lib/gamification"
import { saveGameResult } from "@/lib/gameClient"
import { createClient } from "@/lib/supabase/client"

function TimeAttackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const docId = searchParams.get("doc")
  const source = (searchParams.get("source") as "quiz" | "exam") || "quiz"

  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready")
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [globalTimer, setGlobalTimer] = useState(60)
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null)
  const [gamState, setGamState] = useState<GamificationState | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [docTitle, setDocTitle] = useState("")
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [timeAdded, setTimeAdded] = useState(0)
  const [questionsAnswered, setQuestionsAnswered] = useState(0)

  // Load questions
  useEffect(() => {
    async function load() {
      setGamState(loadGamificationState())
      if (!docId) {
        setQuestions(getMockQuestions())
        setDocTitle("Demo Questions")
        return
      }
      try {
        const supabase = createClient()
        if (source === "quiz") {
          const { data: quizzes } = await supabase.from("quizzes").select("id").eq("document_id", docId).limit(1)
          if (quizzes?.[0]) {
            const { data: qs } = await supabase.from("quiz_questions").select("question, options, correct_answer").eq("quiz_id", quizzes[0].id)
            if (qs && qs.length > 0) setQuestions(getRandomQuestions(convertQuizToGameQuestions(qs), 50))
          }
        } else {
          const { data: doc } = await supabase.from("documents").select("study_set_id").eq("id", docId).single()
          if (doc?.study_set_id) {
            const { data: exams } = await supabase.from("mock_exams").select("id").eq("study_set_id", doc.study_set_id).limit(1)
            if (exams?.[0]) {
              const { data: qs } = await supabase.from("mock_exam_questions").select("question, options, correct_answer").eq("exam_id", exams[0].id)
              if (qs && qs.length > 0) setQuestions(getRandomQuestions(convertQuizToGameQuestions(qs), 50))
            }
          }
        }
        const { data: docData } = await supabase.from("documents").select("title").eq("id", docId).single()
        if (docData) setDocTitle(docData.title)
      } catch (e) {
        console.error("Load error:", e)
      }
    }
    load()
  }, [docId, source])

  useEffect(() => {
    if (questions.length === 0) { setQuestions(getMockQuestions()); setDocTitle("Demo Questions") }
  }, [questions.length])

  // Global countdown
  useEffect(() => {
    if (gameState !== "playing") return
    const interval = setInterval(() => {
      setGlobalTimer(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState])

  const endGame = useCallback(() => {
    setGameState("ended")
    if (gamState) {
      const newState = recordGameSession(gamState, correctCount, questionsAnswered)
      setGamState(newState)
    }
    // Save to Supabase
    saveGameResult({
      gameMode: "time-attack",
      documentId: docId || null,
      score: score,
      correct: correctCount,
      total: questionsAnswered,
      durationSeconds: 60,
    })
  }, [gamState, correctCount, questionsAnswered, docId, score])

  const handleAnswer = useCallback((optionIndex: number) => {
    if (showResult) return
    const q = questions[currentIndex % questions.length]
    if (!q) return
    const isCorrect = optionIndex === q.correctIndex
    setShowResult(isCorrect ? "correct" : "wrong")
    setQuestionsAnswered(prev => prev + 1)

    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setBestStreak(prev => Math.max(prev, newStreak))
      const multiplier = Math.min(1 + Math.floor(newStreak / 3) * 0.5, 4)
      setComboMultiplier(multiplier)
      const points = Math.round(150 * multiplier)
      setScore(prev => prev + points)
      setCorrectCount(prev => prev + 1)
      setXpGained(prev => prev + 15)
      // Add time
      const addedTime = 5
      setGlobalTimer(prev => prev + addedTime)
      setTimeAdded(addedTime)
    } else {
      setStreak(0)
      setComboMultiplier(1)
      setWrongCount(prev => prev + 1)
      // Penalty: lose 3 seconds
      setGlobalTimer(prev => Math.max(prev - 3, 1))
      setTimeAdded(-3)
    }

    setTimeout(() => {
      setShowResult(null)
      setTimeAdded(0)
      setCurrentIndex(prev => prev + 1)
    }, 600)
  }, [currentIndex, questions, showResult, streak])

  const startGame = () => {
    setGameState("playing")
    setCurrentIndex(0)
    setScore(0)
    setCorrectCount(0)
    setWrongCount(0)
    setGlobalTimer(60)
    setStreak(0)
    setBestStreak(0)
    setComboMultiplier(1)
    setXpGained(0)
    setQuestionsAnswered(0)
  }

  // READY screen
  if (gameState === "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          {/* 3D Image */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="relative w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image src="/images/game-time-attack.jpg" alt="Time Attack" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent" />
          </motion.div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-card to-secondary/20 border border-amber-500/20">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold mb-3"
            >
              <Flame className="w-3.5 h-3.5" />
              TIME ATTACK
            </motion.div>

            <h1 className="text-3xl font-black mb-2">Beat the Clock</h1>
            {docTitle && <p className="text-sm font-medium text-primary mb-1 line-clamp-1">{docTitle}</p>}
            <p className="text-muted-foreground text-sm mb-6">
              Answer as many questions as you can before time runs out. Correct answers add +5 seconds!
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-black text-amber-500">60s</p>
                <p className="text-[10px] text-muted-foreground">Start Time</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Zap className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-black text-green-500">+5s</p>
                <p className="text-[10px] text-muted-foreground">Per Correct</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-black text-red-500">-3s</p>
                <p className="text-[10px] text-muted-foreground">Per Wrong</p>
              </div>
            </div>

            <Button onClick={startGame} size="lg" className="w-full h-14 text-lg font-black rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
              Start Time Attack
            </Button>
            <Link href="/game">
              <Button variant="ghost" className="mt-3 w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Game Modes</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ENDED screen
  if (gameState === "ended") {
    const total = questionsAnswered || 1
    const accuracy = Math.round((correctCount / total) * 100)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card to-secondary/20 border border-border/50 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30"
          >
            <Timer className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl font-black mb-1">{"Time's Up!"}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {accuracy >= 80 ? "Incredible speed and accuracy!" : accuracy >= 60 ? "Great performance!" : "Keep practicing!"}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black text-primary">{score.toLocaleString()}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black text-green-500">{questionsAnswered}</p><p className="text-xs text-muted-foreground">Answered</p></div>
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black">{correctCount}/{questionsAnswered}</p><p className="text-xs text-muted-foreground">Correct</p></div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <p className="text-2xl font-black text-amber-500">{bestStreak}</p><p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
            <div className="col-span-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-2xl font-black text-amber-500">+{xpGained} XP</p><p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={startGame} size="lg" className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
              <RotateCcw className="w-4 h-4 mr-2" />Play Again
            </Button>
            <Link href="/game"><Button variant="outline" className="w-full h-12 rounded-xl bg-transparent"><Gamepad2 className="w-4 h-4 mr-2" />Game Modes</Button></Link>
            <Link href="/dashboard" className="block"><Button variant="ghost" className="w-full h-12 rounded-xl"><Home className="w-4 h-4 mr-2" />Dashboard</Button></Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // PLAYING
  const q = questions[currentIndex % questions.length]
  if (!q) return null
  const timerPercent = (globalTimer / 90) * 100
  const isUrgent = globalTimer <= 10

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 overflow-hidden relative">
      {/* Animated fire particles for urgency */}
      {isUrgent && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-red-500/60"
              initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), y: typeof window !== 'undefined' ? window.innerHeight : 800 }}
              animate={{ y: -100, opacity: [0, 1, 0], scale: [0.5, 1.5, 0] }}
              transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      {/* HUD */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/game"><button className="text-white/60 hover:text-white p-1.5"><ArrowLeft className="w-5 h-5" /></button></Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10">
            <Target className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-bold text-white">#{questionsAnswered + 1}</span>
          </div>
        </div>

        {/* Timer - big and central */}
        <motion.div
          animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-lg ${isUrgent ? "bg-red-500/30 text-red-400" : "bg-amber-500/20 text-amber-400"}`}
        >
          <Clock className="w-5 h-5" />
          {globalTimer}s
          <AnimatePresence>
            {timeAdded !== 0 && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -5 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-sm font-bold ${timeAdded > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {timeAdded > 0 ? `+${timeAdded}s` : `${timeAdded}s`}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Combo */}
          {comboMultiplier > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black"
            >
              {comboMultiplier}x
            </motion.div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/20">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1.5 bg-white/5">
        <motion.div
          className={`h-full transition-colors duration-300 ${isUrgent ? "bg-red-500" : "bg-amber-500"}`}
          style={{ width: `${Math.min(timerPercent, 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Streak indicator */}
      {streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30"
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-black text-orange-400">{streak} STREAK</span>
          {[...Array(Math.min(streak, 5))].map((_, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-orange-400"
            />
          ))}
        </motion.div>
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-4 py-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center mb-4 sm:mb-6">
              <p className="text-base sm:text-xl font-bold text-white leading-relaxed">{q.question}</p>
            </div>

            {/* Answer grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {q.options.map((option, index) => {
                const labels = ["A", "B", "C", "D"]
                const colors = [
                  "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400",
                  "from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400",
                  "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400",
                  "from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400",
                ]
                return (
                  <motion.button
                    key={`${currentIndex}-${index}`}
                    onClick={() => handleAnswer(index)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      showResult
                        ? index === q.correctIndex
                          ? "bg-green-500/30 border-green-500"
                          : "bg-white/5 border-white/10 opacity-50"
                        : `bg-gradient-to-br ${colors[index]}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        showResult && index === q.correctIndex ? "bg-green-500 text-white" : "bg-white/10 text-white/70"
                      }`}>
                        {labels[index]}
                      </span>
                      <span className="text-sm sm:text-base font-medium text-white/90 leading-snug">{option}</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Answer feedback overlay */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className={`px-8 py-4 rounded-2xl font-black text-2xl shadow-2xl ${
                showResult === "correct" ? "bg-green-500/90 text-white shadow-green-500/40" : "bg-red-500/90 text-white shadow-red-500/40"
              }`}>
                {showResult === "correct" ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-8 h-8" />
                    <span>+{Math.round(150 * comboMultiplier)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-8 h-8" />
                    <span>-3s</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function TimeAttackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
      </div>
    }>
      <TimeAttackContent />
    </Suspense>
  )
}
