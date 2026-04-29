"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DocumentUploader } from "@/components/dashboard/document-uploader"
import { XPBar } from "@/components/gamification/xp-bar"
import { StudyModeSelector } from "@/components/gamification/study-mode-selector"
import { GamificationState } from "@/lib/gamification"
import { Sparkles, CheckCircle2, XCircle, Gamepad2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { loadGamificationState } from "@/lib/gamification" // Declare the variable before using it

export default function DashboardPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [gamificationState, setGamificationState] = useState<GamificationState | null>(null)

  useEffect(() => {
    // Try to load from Supabase API first, fall back to localStorage
    async function loadStats() {
      try {
        const res = await fetch("/api/game/stats")
        if (res.ok) {
          const data = await res.json()
          if (data.stats && data.stats.xp > 0) {
            setGamificationState({
              xp: data.stats.xp,
              level: data.stats.level,
              streak: data.stats.streak,
              gamesPlayed: data.stats.games_played,
              correctAnswers: data.stats.correct_answers,
              totalAnswers: data.stats.total_answers,
              achievements: data.achievements || [],
              lastPlayedDate: data.stats.last_played_date || null,
            })
            return
          }
        }
      } catch {}
      // Fallback to localStorage
      setGamificationState(loadGamificationState())
    }
    loadStats()
  }, [])

  const handleGenerate = async (
    title: string,
    content: string,
    options: { flashcardCount: number; quizCount: number; examCount: number; examType: string }
  ) => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, options }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate content")
      }

      const data = await response.json()

      setNotification({ type: "success", message: "Study materials generated! Redirecting..." })
      
      // Redirect to study materials page with the document ID
      setTimeout(() => {
        router.push(`/dashboard/study-materials?doc=${data.documentId}`)
      }, 1000)
      
    } catch (error) {
      console.error("Generation error:", error)
      setNotification({ type: "error", message: error instanceof Error ? error.message : "Failed to generate content" })
      setTimeout(() => setNotification(null), 5000)
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
              notification.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-600"
                : "bg-red-500/10 border-red-500/20 text-red-600"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 p-1 hover:bg-secondary rounded-md"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
          {/* XP Bar */}
          {gamificationState && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <XPBar state={gamificationState} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Study Tools</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Create Study Materials</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload your document and let AI generate flashcards, summaries, quizzes, and mock exams instantly
            </p>
          </motion.div>

          {/* Quick Play Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex justify-center"
          >
            <Link href="/game">
              <Button variant="outline" className="gap-2 rounded-full px-6 bg-transparent">
                <Gamepad2 className="w-4 h-4" />
                Play Game Modes
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Study Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StudyModeSelector />
        </motion.div>

        {/* Document Uploader */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DocumentUploader onGenerate={handleGenerate} isGenerating={isGenerating} />
        </motion.div>
      </div>
    </div>
  )
}
