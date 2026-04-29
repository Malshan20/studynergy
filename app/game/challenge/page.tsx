"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Trophy, Zap, RotateCcw, Home, CheckCircle2, XCircle,
  Swords, Target, Gamepad2, Flame, Heart, Shield, Star, Skull, Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { GameQuestion, convertQuizToGameQuestions, getMockQuestions, getRandomQuestions } from "@/lib/gameAdapter"
import { loadGamificationState, recordGameSession, GamificationState } from "@/lib/gamification"
import { saveGameResult } from "@/lib/gameClient"
import { createClient } from "@/lib/supabase/client"

function ChallengeContent() {
  const searchParams = useSearchParams()
  const docId = searchParams.get("doc")
  const source = (searchParams.get("source") as "quiz" | "exam") || "quiz"

  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready")
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null)
  const [gamState, setGamState] = useState<GamificationState | null>(null)
  const [xpGained, setXpGained] = useState(0)
  const [docTitle, setDocTitle] = useState("")
  const [multiplier, setMultiplier] = useState(1)
  const [shieldActive, setShieldActive] = useState(false)
  const [shieldUsed, setShieldUsed] = useState(false)
  const [lives, setLives] = useState(1)
  const [difficultyLevel, setDifficultyLevel] = useState(1)
  const [timeForQuestion, setTimeForQuestion] = useState(15)
  const [timer, setTimer] = useState(15)
  const [showShieldSave, setShowShieldSave] = useState(false)

  // Load questions
  useEffect(() => {
    async function load() {
      setGamState(loadGamificationState())
      if (!docId) { setQuestions(getMockQuestions()); setDocTitle("Demo Questions"); return }
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
      } catch (e) { console.error("Load error:", e) }
    }
    load()
  }, [docId, source])

  useEffect(() => {
    if (questions.length === 0) { setQuestions(getMockQuestions()); setDocTitle("Demo Questions") }
  }, [questions.length])

  // Per-question timer that gets shorter as difficulty increases
  useEffect(() => {
    if (gameState !== "playing") return
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleTimeout()
          return timeForQuestion
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [gameState, currentIndex, timeForQuestion])

  const handleTimeout = useCallback(() => {
    if (shieldActive && !shieldUsed) {
      setShieldUsed(true)
      setShieldActive(false)
      setShowShieldSave(true)
      setTimer(timeForQuestion)
      setTimeout(() => setShowShieldSave(false), 1500)
      return
    }
    setShowResult("wrong")
    setTimeout(() => {
      setGameState("ended")
      if (gamState) {
        const newState = recordGameSession(gamState, correctCount, currentIndex + 1)
        setGamState(newState)
      }
      saveGameResult({
        gameMode: "challenge",
        documentId: docId || null,
        score: score,
        correct: correctCount,
        total: currentIndex + 1,
      })
    }, 1000)
  }, [shieldActive, shieldUsed, gamState, correctCount, currentIndex, timeForQuestion, docId, score])

  const handleAnswer = useCallback((optionIndex: number) => {
    if (showResult) return
    const q = questions[currentIndex % questions.length]
    if (!q) return
    const isCorrect = optionIndex === q.correctIndex
    setShowResult(isCorrect ? "correct" : "wrong")

    if (isCorrect) {
      const newMultiplier = Math.min(multiplier + 0.25, 5)
      setMultiplier(newMultiplier)
      const points = Math.round(200 * newMultiplier)
      setScore(prev => prev + points)
      setCorrectCount(prev => prev + 1)
      setXpGained(prev => prev + Math.round(15 * newMultiplier))

      // Increase difficulty every 5 correct
      if ((correctCount + 1) % 5 === 0) {
        const newDifficulty = difficultyLevel + 1
        setDifficultyLevel(newDifficulty)
        const newTime = Math.max(15 - newDifficulty * 2, 5)
        setTimeForQuestion(newTime)
      }

      // Earn shield at 10 correct
      if (correctCount + 1 === 10 && !shieldUsed) {
        setShieldActive(true)
      }

      setTimeout(() => {
        setShowResult(null)
        setCurrentIndex(prev => prev + 1)
        setTimer(timeForQuestion)
      }, 600)
    } else {
      // Check for shield
      if (shieldActive && !shieldUsed) {
        setShieldUsed(true)
        setShieldActive(false)
        setShowShieldSave(true)
        setTimeout(() => {
          setShowShieldSave(false)
          setShowResult(null)
          setCurrentIndex(prev => prev + 1)
          setTimer(timeForQuestion)
        }, 1500)
        return
      }
  // Game over
  setTimeout(() => {
  setGameState("ended")
  if (gamState) {
  const newState = recordGameSession(gamState, correctCount, currentIndex + 1)
  setGamState(newState)
  }
  saveGameResult({
    gameMode: "challenge",
    documentId: docId || null,
    score: score,
    correct: correctCount,
    total: currentIndex + 1,
  })
  }, 1200)
    }
  }, [currentIndex, questions, showResult, multiplier, correctCount, difficultyLevel, shieldActive, shieldUsed, gamState, timeForQuestion])

  const startGame = () => {
    setGameState("playing")
    setCurrentIndex(0)
    setScore(0)
    setCorrectCount(0)
    setMultiplier(1)
    setShieldActive(false)
    setShieldUsed(false)
    setDifficultyLevel(1)
    setTimeForQuestion(15)
    setTimer(15)
    setLives(1)
    setXpGained(0)
    setShowShieldSave(false)
  }

  // READY screen
  if (gameState === "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          {/* 3D Image */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-2xl shadow-red-500/20"
          >
            <Image src="/images/game-challenge.jpg" alt="Challenge Mode" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/30 to-transparent" />
          </motion.div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-card to-secondary/20 border border-red-500/20">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-bold mb-3"
            >
              <Swords className="w-3.5 h-3.5" />
              CHALLENGE MODE
            </motion.div>

            <h1 className="text-3xl font-black mb-2">Survive or Die</h1>
            {docTitle && <p className="text-sm font-medium text-primary mb-1 line-clamp-1">{docTitle}</p>}
            <p className="text-muted-foreground text-sm mb-6">
              One wrong answer and it is game over. Questions get harder the further you go. Only legends survive.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-black text-red-500">1</p>
                <p className="text-[10px] text-muted-foreground">Life</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Zap className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-black text-purple-500">5x</p>
                <p className="text-[10px] text-muted-foreground">Max Mult</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-black text-blue-500">1</p>
                <p className="text-[10px] text-muted-foreground">Shield @10</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-left">
              <p className="text-xs text-amber-500 font-bold mb-1">Difficulty Progression</p>
              <div className="flex items-center gap-2 flex-wrap">
                {["Easy (15s)", "Medium (13s)", "Hard (11s)", "Expert (9s)", "Insane (5s)"].map((d, i) => (
                  <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">{d}</span>
                ))}
              </div>
            </div>

            <Button onClick={startGame} size="lg" className="w-full h-14 text-lg font-black rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600">
              Accept the Challenge
            </Button>
            <Link href="/game"><Button variant="ghost" className="mt-3 w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Game Modes</Button></Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ENDED
  if (gameState === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-card to-secondary/20 border border-border/50 text-center">
          {/* Death / Victory animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${
              correctCount >= 20
                ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30"
                : correctCount >= 10
                ? "bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/30"
                : "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30"
            }`}
          >
            {correctCount >= 20 ? <Crown className="w-12 h-12 text-white" /> :
             correctCount >= 10 ? <Trophy className="w-12 h-12 text-white" /> :
             <Skull className="w-12 h-12 text-white" />}
          </motion.div>

          <h1 className="text-3xl font-black mb-1">
            {correctCount >= 20 ? "Legendary!" : correctCount >= 10 ? "Impressive!" : correctCount >= 5 ? "Not Bad!" : "Game Over"}
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            {showResult === "wrong" ? "You answered incorrectly." : "Time ran out!"}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Reached difficulty level {difficultyLevel}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black text-primary">{score.toLocaleString()}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black text-green-500">{correctCount}</p><p className="text-xs text-muted-foreground">Survived</p></div>
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black">{multiplier.toFixed(1)}x</p><p className="text-xs text-muted-foreground">Max Multiplier</p></div>
            <div className="p-4 rounded-xl bg-secondary/50"><p className="text-2xl font-black text-purple-500">Lv.{difficultyLevel}</p><p className="text-xs text-muted-foreground">Difficulty</p></div>
            <div className="col-span-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-2xl font-black text-amber-500">+{xpGained} XP</p><p className="text-xs text-muted-foreground">Earned</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={startGame} size="lg" className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600">
              <RotateCcw className="w-4 h-4 mr-2" />Try Again
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
  const timerPercent = (timer / timeForQuestion) * 100
  const isUrgent = timer <= 4

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-red-950/10 to-slate-950 overflow-hidden relative">
      {/* Screen shake on wrong answer */}
      <motion.div
        animate={showResult === "wrong" ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col"
      >
        {/* HUD */}
        <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3">
            <Link href="/game"><button className="text-white/60 hover:text-white p-1.5"><ArrowLeft className="w-5 h-5" /></button></Link>
            
            {/* Life */}
            <div className="flex items-center gap-1">
              <Heart className={`w-5 h-5 ${shieldActive ? "text-blue-400" : "text-red-500"} fill-current`} />
              {shieldActive && <Shield className="w-4 h-4 text-blue-400" />}
            </div>

            {/* Difficulty badge */}
            <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
              difficultyLevel >= 4 ? "bg-red-500/30 text-red-400" :
              difficultyLevel >= 3 ? "bg-orange-500/30 text-orange-400" :
              difficultyLevel >= 2 ? "bg-amber-500/30 text-amber-400" :
              "bg-green-500/30 text-green-400"
            }`}>
              {difficultyLevel >= 4 ? "INSANE" : difficultyLevel >= 3 ? "HARD" : difficultyLevel >= 2 ? "MEDIUM" : "EASY"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer */}
            <motion.div
              animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`px-2.5 py-1.5 rounded-full text-xs font-black ${isUrgent ? "bg-red-500/30 text-red-400" : "bg-white/10 text-white"}`}
            >
              {timer}s
            </motion.div>

            {/* Multiplier */}
            <motion.div
              key={multiplier}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black"
            >
              {multiplier.toFixed(1)}x
            </motion.div>

            {/* Score */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{score.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-2 bg-white/5">
          <motion.div
            className={`h-full transition-colors duration-300 rounded-r-full ${
              isUrgent ? "bg-red-500" : difficultyLevel >= 3 ? "bg-orange-500" : "bg-green-500"
            }`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 py-3">
          {[...Array(Math.min(correctCount + 5, 20))].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`w-2 h-2 rounded-full ${
                i < correctCount ? "bg-green-500" : i === correctCount ? "bg-white animate-pulse" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Shield save overlay */}
        <AnimatePresence>
          {showShieldSave && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-blue-500/20 border border-blue-500/30"
              >
                <Shield className="w-16 h-16 text-blue-400" />
                <p className="text-2xl font-black text-blue-400">SHIELD SAVED YOU!</p>
                <p className="text-sm text-white/60">One-time protection used</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center px-4 py-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-center mb-4 sm:mb-6">
                <p className="text-xs font-bold text-muted-foreground mb-2">Question #{correctCount + 1}</p>
                <p className="text-base sm:text-xl font-bold text-white leading-relaxed">{q.question}</p>
              </div>

              {/* Answer grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {q.options.map((option, index) => {
                  const labels = ["A", "B", "C", "D"]
                  return (
                    <motion.button
                      key={`${currentIndex}-${index}`}
                      onClick={() => handleAnswer(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        showResult
                          ? index === q.correctIndex
                            ? "bg-green-500/30 border-green-500"
                            : showResult === "wrong"
                            ? "bg-red-500/10 border-red-500/30 opacity-50"
                            : "bg-white/5 border-white/10 opacity-50"
                          : "bg-white/5 border-white/15 hover:border-white/40 hover:bg-white/10"
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

          {/* Correct feedback */}
          <AnimatePresence>
            {showResult === "correct" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="px-8 py-4 rounded-2xl bg-green-500/90 text-white font-black text-2xl shadow-2xl shadow-green-500/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-8 h-8" />
                    +{Math.round(200 * multiplier)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Death animation */}
          <AnimatePresence>
            {showResult === "wrong" && !showShieldSave && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 1] }}
                  className="px-10 py-6 rounded-3xl bg-red-500/90 text-white shadow-2xl shadow-red-500/40"
                >
                  <Skull className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-3xl font-black">ELIMINATED</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
    }>
      <ChallengeContent />
    </Suspense>
  )
}
