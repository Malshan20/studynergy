"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Trophy, Medal, Crown, Zap, Loader2, Target, Flame, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LeaderboardPlayer {
  user_id: string
  display_name: string
  xp: number
  level: number
  games_played: number
  correct_answers: number
  total_answers: number
  best_streak: number
  best_score: number
  streak: number
}

function getRankColors(rank: number) {
  if (rank === 1) return { bg: "bg-gradient-to-r from-amber-500/20 to-amber-500/5", border: "border-amber-500/40", text: "text-amber-500" }
  if (rank === 2) return { bg: "bg-gradient-to-r from-slate-400/15 to-slate-400/5", border: "border-slate-400/30", text: "text-slate-400" }
  if (rank === 3) return { bg: "bg-gradient-to-r from-amber-700/15 to-amber-700/5", border: "border-amber-700/30", text: "text-amber-700" }
  return { bg: "bg-card", border: "border-border/50", text: "text-muted-foreground" }
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/game/leaderboard")
        if (res.ok) {
          const data = await res.json()
          setLeaderboard(data.leaderboard || [])
          setTotalPlayers(data.totalPlayers || 0)
          setCurrentUserId(data.currentUser?.userId || null)
          setUserRank(data.currentUser?.rank || null)
        }
      } catch (e) {
        console.error("Failed to load leaderboard:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6">
          <Link href="/game">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back to Game Hub
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <Medal className="w-7 h-7 text-amber-500" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1 text-sm flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {totalPlayers} players ranked
              </p>
            </div>

            {userRank && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Your Rank: #{userRank}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Players Yet</h2>
            <p className="text-muted-foreground mb-6">Be the first to play a game and claim the top spot!</p>
            <Link href="/game">
              <Button>Play a Game</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex items-end justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 h-52 sm:h-56">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mb-2 border-4 border-slate-400/50 ${top3[1].user_id === currentUserId ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                    <span className="text-lg sm:text-xl font-black text-white">2</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-[100px]">
                    {top3[1].user_id === currentUserId ? "You" : top3[1].display_name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Lv.{top3[1].level}</p>
                  <p className="text-[10px] sm:text-xs text-amber-500 font-bold">{top3[1].xp.toLocaleString()} XP</p>
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-t from-slate-500 to-slate-400 rounded-t-lg mt-2" />
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 mb-1" />
                  </motion.div>
                  <div className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-2 border-4 border-amber-400/50 shadow-lg shadow-amber-500/30 ${top3[0].user_id === currentUserId ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                    <span className="text-xl sm:text-2xl font-black text-white">1</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-[100px]">
                    {top3[0].user_id === currentUserId ? "You" : top3[0].display_name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Lv.{top3[0].level}</p>
                  <p className="text-[10px] sm:text-xs text-amber-500 font-bold">{top3[0].xp.toLocaleString()} XP</p>
                  <div className="w-20 sm:w-24 h-28 sm:h-32 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2" />
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center mb-2 border-4 border-amber-700/50 ${top3[2].user_id === currentUserId ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}>
                    <span className="text-lg sm:text-xl font-black text-white">3</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-[100px]">
                    {top3[2].user_id === currentUserId ? "You" : top3[2].display_name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Lv.{top3[2].level}</p>
                  <p className="text-[10px] sm:text-xs text-amber-500 font-bold">{top3[2].xp.toLocaleString()} XP</p>
                  <div className="w-20 sm:w-24 h-16 sm:h-20 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-lg mt-2" />
                </motion.div>
              </div>
            )}

            {/* Full Ranking List */}
            <div className="space-y-2">
              {rest.map((player, index) => {
                const rank = index + 4
                const isCurrentUser = player.user_id === currentUserId
                const colors = getRankColors(rank)
                const accuracy = player.total_answers > 0 ? Math.round((player.correct_answers / player.total_answers) * 100) : 0

                return (
                  <motion.div
                    key={player.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.04 }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border ${
                      isCurrentUser
                        ? "bg-primary/10 border-primary/30"
                        : `${colors.bg} ${colors.border}`
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 sm:w-10 text-center shrink-0">
                      <span className={`text-base sm:text-lg font-bold ${isCurrentUser ? "text-primary" : colors.text}`}>
                        {rank}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isCurrentUser ? "text-primary" : ""}`}>
                        {isCurrentUser ? "You" : player.display_name}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                        <span>Lv.{player.level}</span>
                        <span className="hidden sm:inline">{player.games_played} games</span>
                        <span className="flex items-center gap-0.5">
                          <Target className="w-3 h-3" />
                          {accuracy}%
                        </span>
                        {player.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-orange-500">
                            <Flame className="w-3 h-3" />
                            {player.streak}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* XP Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 shrink-0">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs sm:text-sm font-bold text-amber-500">
                        {player.xp.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* If leaderboard has fewer than 3 entries, show a simpler list */}
            {top3.length < 3 && (
              <div className="space-y-2">
                {leaderboard.map((player, index) => {
                  const rank = index + 1
                  const isCurrentUser = player.user_id === currentUserId
                  const colors = getRankColors(rank)

                  return (
                    <motion.div
                      key={player.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 sm:gap-4 p-4 rounded-xl border ${
                        isCurrentUser
                          ? "bg-primary/10 border-primary/30"
                          : `${colors.bg} ${colors.border}`
                      }`}
                    >
                      <div className="w-10 text-center shrink-0">
                        {rank === 1 ? <Crown className="w-6 h-6 text-amber-400 mx-auto" /> :
                         rank === 2 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" /> :
                         rank === 3 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> :
                         <span className="text-lg font-bold text-muted-foreground">{rank}</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                          {isCurrentUser ? "You" : player.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {player.level} - {player.games_played} games
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-bold text-amber-500">
                          {player.xp.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
