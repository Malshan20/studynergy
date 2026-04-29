"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Car,
  Clock,
  Swords,
  Zap,
  Trophy,
  FileText,
  BookOpen,
  Gamepad2,
  ChevronRight,
  Sparkles,
  Target,
  Flame,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { loadGamificationState, GamificationState, getLevelProgress, getXPForLevel } from "@/lib/gamification"

interface DocumentItem {
  id: string
  title: string
  created_at: string
  quizCount: number
  examCount: number
}

const GAME_MODES = [
  {
    id: "quiz-runner",
    name: "Quiz Runner",
    tagline: "Race through answers at full speed",
    description: "Steer your car into the correct answer lane. Speed bonuses for quick answers. Can you reach the finish line with a perfect score?",
    image: "/images/game-quiz-runner.jpg",
    color: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/60",
    icon: Car,
    stats: [
      { label: "Time", value: "10s/Q" },
      { label: "XP", value: "+10/correct" },
      { label: "Bonus", value: "Speed bonus" },
    ],
  },
  {
    id: "time-attack",
    name: "Time Attack",
    tagline: "Beat the clock before time runs out",
    description: "Answer as many questions as possible before the global timer hits zero. Every correct answer adds precious seconds. How far can you go?",
    image: "/images/game-time-attack.jpg",
    color: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500/60",
    icon: Clock,
    stats: [
      { label: "Timer", value: "60s total" },
      { label: "Bonus", value: "+5s/correct" },
      { label: "XP", value: "+15/correct" },
    ],
  },
  {
    id: "challenge",
    name: "Challenge Mode",
    tagline: "No mistakes allowed. Survive as long as you can",
    description: "One wrong answer and it's game over. Questions get progressively harder. Earn massive XP multipliers the further you go. Only the brave survive.",
    image: "/images/game-challenge.jpg",
    color: "from-red-500 to-pink-500",
    bgGlow: "bg-red-500/20",
    borderColor: "border-red-500/30",
    hoverBorder: "hover:border-red-500/60",
    icon: Swords,
    stats: [
      { label: "Lives", value: "1 only" },
      { label: "Difficulty", value: "Increases" },
      { label: "XP", value: "2x multiplier" },
    ],
  },
]

export default function GameHubPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null)
  const [selectedSource, setSelectedSource] = useState<"quiz" | "exam">("quiz")
  const [phase, setPhase] = useState<"select-doc" | "select-mode">("select-doc")
  const [gamState, setGamState] = useState<GamificationState | null>(null)

  useEffect(() => {
    setGamState(loadGamificationState())
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: docs } = await supabase
        .from("documents")
        .select("id, title, created_at, study_set_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!docs || docs.length === 0) { setLoading(false); return }

      const items: DocumentItem[] = []
      for (const doc of docs) {
        const { data: quizzes } = await supabase.from("quizzes").select("id").eq("document_id", doc.id)
        let quizQ = 0
        if (quizzes && quizzes.length > 0) {
          const { count } = await supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", quizzes[0].id)
          quizQ = count || 0
        }
        let examQ = 0
        if (doc.study_set_id) {
          const { data: exams } = await supabase.from("mock_exams").select("id").eq("study_set_id", doc.study_set_id)
          if (exams && exams.length > 0) {
            const { count } = await supabase.from("mock_exam_questions").select("id", { count: "exact", head: true }).eq("exam_id", exams[0].id)
            examQ = count || 0
          }
        }
        items.push({ id: doc.id, title: doc.title, created_at: doc.created_at, quizCount: quizQ, examCount: examQ })
      }
      setDocuments(items.filter(d => d.quizCount > 0 || d.examCount > 0))
      setLoading(false)
    }
    load()
  }, [])

  const handleDocSelect = (doc: DocumentItem, source: "quiz" | "exam") => {
    setSelectedDoc(doc)
    setSelectedSource(source)
    setPhase("select-mode")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"
          />
          <p className="text-muted-foreground font-medium">Loading your study arsenal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {phase === "select-mode" ? (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setPhase("select-doc")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black">
              {phase === "select-doc" ? "Game Mode" : "Choose Your Battle"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {phase === "select-doc"
                ? "Pick a study material to play with"
                : `Playing with: ${selectedDoc?.title}`}
            </p>
          </div>

          {/* Mini XP Display */}
          {gamState && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-xs font-black text-primary-foreground">{gamState.level}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold">{gamState.xp} XP</p>
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${getLevelProgress(gamState)}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* === PHASE 1: SELECT DOCUMENT === */}
          {phase === "select-doc" && (
            <motion.div
              key="select-doc"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {documents.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Study Materials Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                    Generate some study materials first, then come back to play game modes with your content.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard">
                      <Button className="gap-2 rounded-xl h-12 px-6">
                        <BookOpen className="w-4 h-4" />
                        Create Study Materials
                      </Button>
                    </Link>
                    <Link href={`/game/play?mode=quiz-runner`}>
                      <Button variant="outline" className="gap-2 rounded-xl h-12 px-6 bg-transparent">
                        <Gamepad2 className="w-4 h-4" />
                        Play Demo
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base truncate">{doc.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row gap-2">
                          {doc.quizCount > 0 && (
                            <button
                              onClick={() => handleDocSelect(doc, "quiz")}
                              className="flex-1 flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Quiz Questions</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[11px] font-bold text-blue-500">{doc.quizCount}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                          {doc.examCount > 0 && (
                            <button
                              onClick={() => handleDocSelect(doc, "exam")}
                              className="flex-1 flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Exam Questions</span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[11px] font-bold text-amber-500">{doc.examCount}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Demo play */}
                  <div className="pt-4 mt-2 border-t border-border/50">
                    <Link href="/game/play?mode=quiz-runner">
                      <Button variant="ghost" className="w-full gap-2 text-muted-foreground rounded-xl h-12">
                        <Gamepad2 className="w-4 h-4" />
                        Play Demo with Sample Questions
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* === PHASE 2: SELECT GAME MODE === */}
          {phase === "select-mode" && selectedDoc && (
            <motion.div
              key="select-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {GAME_MODES.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/game/${mode.id === "quiz-runner" ? "play" : mode.id === "time-attack" ? "time-attack" : "challenge"}?doc=${selectedDoc.id}&source=${selectedSource}`}>
                    <div className={`group relative rounded-2xl border ${mode.borderColor} ${mode.hoverBorder} bg-card overflow-hidden transition-all cursor-pointer`}>
                      {/* Glow effect */}
                      <div className={`absolute inset-0 ${mode.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />

                      <div className="relative flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                        {/* Image */}
                        <div className="relative w-full sm:w-40 h-40 sm:h-32 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={mode.image || "/placeholder.svg"}
                            alt={mode.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${mode.color} opacity-20`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center`}>
                              <mode.icon className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-lg font-black">{mode.name}</h3>
                            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                          </div>

                          <p className="text-xs font-semibold text-primary mb-1">{mode.tagline}</p>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{mode.description}</p>

                          {/* Stats */}
                          <div className="flex gap-2 flex-wrap">
                            {mode.stats.map((stat) => (
                              <span key={stat.label} className="px-2.5 py-1 rounded-lg bg-secondary/50 text-[11px] font-semibold">
                                {stat.label}: <span className="text-foreground">{stat.value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
