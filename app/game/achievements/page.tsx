"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Trophy, Flame, Target, Gamepad2, Star, Zap,
  Brain, Medal, Crown, Sparkles, ArrowLeft, Lock, CheckCircle2, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"

const ALL_ACHIEVEMENTS = [
  { id: "first_game", name: "First Steps", description: "Play your first game", icon: Gamepad2, color: "text-emerald-500", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", requirement: "Play 1 game" },
  { id: "streak_3", name: "On Fire", description: "Get 3 correct answers in a row", icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30", requirement: "3 answer streak" },
  { id: "streak_7", name: "Unstoppable", description: "Get 7 correct answers in a row", icon: Zap, color: "text-amber-500", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", requirement: "7 answer streak" },
  { id: "games_10", name: "Dedicated", description: "Play 10 games total", icon: Target, color: "text-blue-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", requirement: "Play 10 games" },
  { id: "games_50", name: "Veteran", description: "Play 50 games total", icon: Medal, color: "text-indigo-500", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/30", requirement: "Play 50 games" },
  { id: "perfect_score", name: "Perfectionist", description: "Score 100+ in a single game", icon: Star, color: "text-yellow-500", bgColor: "bg-yellow-500/10", borderColor: "border-yellow-500/30", requirement: "Score 100+" },
  { id: "xp_1000", name: "XP Hunter", description: "Earn 1,000 total XP", icon: Sparkles, color: "text-teal-500", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/30", requirement: "1,000 XP" },
  { id: "xp_5000", name: "XP Master", description: "Earn 5,000 total XP", icon: Crown, color: "text-purple-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30", requirement: "5,000 XP" },
  { id: "accuracy_80", name: "Sharp Mind", description: "80%+ accuracy over 20+ answers", icon: Brain, color: "text-pink-500", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/30", requirement: "80% accuracy" },
  { id: "level_5", name: "Rising Star", description: "Reach level 5", icon: Star, color: "text-cyan-500", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30", requirement: "Level 5" },
  { id: "level_10", name: "Study Pro", description: "Reach level 10", icon: Trophy, color: "text-rose-500", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30", requirement: "Level 10" },
  { id: "answers_100", name: "Century", description: "Answer 100 questions correctly", icon: Target, color: "text-lime-500", bgColor: "bg-lime-500/10", borderColor: "border-lime-500/30", requirement: "100 correct" },
]

interface PlayerStats {
  xp: number
  level: number
  streak: number
  games_played: number
  correct_answers: number
  total_answers: number
  best_streak: number
  best_score: number
}

interface GameSession {
  id: string
  game_mode: string
  score: number
  correct: number
  total: number
  created_at: string
}

export default function AchievementsPage() {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/game/stats")
        if (res.ok) {
          const data = await res.json()
          setUnlockedIds(new Set(data.achievements || []))
          setStats(data.stats)
          setSessions(data.sessions || [])
        }
      } catch (e) {
        console.error("Failed to load achievements:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const unlockedCount = unlockedIds.size
  const totalCount = ALL_ACHIEVEMENTS.length
  const progressPct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
          <Link href="/game">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Game Hub
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Trophy className="w-7 h-7 text-amber-500" />
                Achievements
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {unlockedCount} of {totalCount} unlocked
              </p>
            </div>

            {stats && (
              <div className="flex gap-4 sm:gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg text-primary">{stats.xp.toLocaleString()}</p>
                  <p className="text-muted-foreground text-xs">Total XP</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Lv.{stats.level}</p>
                  <p className="text-muted-foreground text-xs">Level</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{stats.games_played}</p>
                  <p className="text-muted-foreground text-xs">Games</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-green-500">{stats.total_answers > 0 ? Math.round((stats.correct_answers / stats.total_answers) * 100) : 0}%</p>
                  <p className="text-muted-foreground text-xs">Accuracy</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(progressPct)}% complete</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ALL_ACHIEVEMENTS.map((achievement, i) => {
            const unlocked = unlockedIds.has(achievement.id)
            const Icon = achievement.icon

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative p-5 rounded-2xl border transition-all ${
                  unlocked
                    ? `bg-card ${achievement.borderColor} shadow-lg`
                    : "bg-card/40 border-border/20 opacity-50"
                }`}
              >
                {unlocked && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${unlocked ? achievement.bgColor : "bg-secondary"}`}>
                  {unlocked ? (
                    <Icon className={`w-6 h-6 ${achievement.color}`} />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <h3 className="font-semibold mt-3">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>

                <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  unlocked ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground"
                }`}>
                  {unlocked ? "Unlocked" : achievement.requirement}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Recent Game History */}
        {sessions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4">Recent Games</h2>
            <div className="space-y-2">
              {sessions.slice(0, 10).map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      session.game_mode === "time-attack" ? "bg-amber-500/10" :
                      session.game_mode === "challenge" ? "bg-red-500/10" : "bg-blue-500/10"
                    }`}>
                      {session.game_mode === "time-attack" ? <Flame className="w-5 h-5 text-amber-500" /> :
                       session.game_mode === "challenge" ? <Target className="w-5 h-5 text-red-500" /> :
                       <Gamepad2 className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm capitalize">{session.game_mode.replace("-", " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.correct}/{session.total} correct
                        {" - "}
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-500">{session.score}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
