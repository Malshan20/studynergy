"use client"

import { motion } from "framer-motion"
import { Zap, Flame, Trophy } from "lucide-react"
import { GamificationState, getLevelProgress, getXPForLevel } from "@/lib/gamification"

interface XPBarProps {
  state: GamificationState
  compact?: boolean
}

export function XPBar({ state, compact = false }: XPBarProps) {
  const progress = getLevelProgress(state)
  const xpForNext = getXPForLevel(state.level)
  const xpForCurrent = state.level > 1 ? getXPForLevel(state.level - 1) : 0
  const currentXP = state.xp - xpForCurrent
  const neededXP = xpForNext - xpForCurrent

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Level Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">Lvl {state.level}</span>
        </div>

        {/* XP Mini Bar */}
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
        </div>

        {/* Streak */}
        {state.streak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{state.streak}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        {/* Level Badge */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-lg font-black text-primary-foreground">{state.level}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="text-sm font-bold">
              {state.level < 5 ? "Beginner" : state.level < 10 ? "Intermediate" : state.level < 20 ? "Advanced" : "Master"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          {state.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-500">{state.streak} day streak</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total XP</p>
            <p className="text-sm font-bold">{state.xp.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentXP} XP</span>
          <span>{neededXP} XP to Level {state.level + 1}</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
