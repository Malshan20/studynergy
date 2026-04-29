"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ACHIEVEMENTS = [
  { id: "first_game", name: "First Steps", check: (stats: any) => stats.games_played >= 1 },
  { id: "streak_3", name: "On Fire", check: (stats: any) => stats.best_streak >= 3 },
  { id: "streak_7", name: "Unstoppable", check: (stats: any) => stats.best_streak >= 7 },
  { id: "games_10", name: "Dedicated", check: (stats: any) => stats.games_played >= 10 },
  { id: "games_50", name: "Veteran", check: (stats: any) => stats.games_played >= 50 },
  { id: "perfect_score", name: "Perfectionist", check: (stats: any) => stats.best_score >= 100 },
  { id: "xp_1000", name: "XP Hunter", check: (stats: any) => stats.xp >= 1000 },
  { id: "xp_5000", name: "XP Master", check: (stats: any) => stats.xp >= 5000 },
  { id: "accuracy_80", name: "Sharp Mind", check: (stats: any) => stats.total_answers >= 20 && (stats.correct_answers / stats.total_answers) >= 0.8 },
  { id: "level_5", name: "Rising Star", check: (stats: any) => stats.level >= 5 },
  { id: "level_10", name: "Study Pro", check: (stats: any) => stats.level >= 10 },
  { id: "answers_100", name: "Century", check: (stats: any) => stats.correct_answers >= 100 },
]

function calculateLevel(xp: number): number {
  // Each level requires more XP: level N needs N*100 total XP
  let level = 1
  let xpNeeded = 100
  let totalXp = 0
  while (totalXp + xpNeeded <= xp) {
    totalXp += xpNeeded
    level++
    xpNeeded = level * 100
  }
  return level
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { gameMode, documentId, score, correct, total, durationSeconds } = await request.json()

    // Save game session
    await supabase.from("game_sessions").insert({
      user_id: user.id,
      game_mode: gameMode || "quiz-runner",
      document_id: documentId || null,
      score: score || 0,
      correct: correct || 0,
      total: total || 0,
      duration_seconds: durationSeconds || null,
    })

    // Get or create player stats
    const { data: existingStats } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", user.id)
      .single()

    const xpEarned = (correct || 0) * 25 + (score || 0)
    const today = new Date().toISOString().split("T")[0]

    if (existingStats) {
      const isConsecutiveDay = existingStats.last_played_date
        ? (() => {
            const last = new Date(existingStats.last_played_date)
            const now = new Date(today)
            const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
            return diff <= 1
          })()
        : false

      const newStreak = existingStats.last_played_date === today
        ? existingStats.streak
        : isConsecutiveDay
        ? existingStats.streak + 1
        : 1

      const newXp = existingStats.xp + xpEarned
      const newLevel = calculateLevel(newXp)
      const newBestStreak = Math.max(existingStats.best_streak, correct || 0)
      const newBestScore = Math.max(existingStats.best_score, score || 0)

      await supabase
        .from("player_stats")
        .update({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          last_played_date: today,
          games_played: existingStats.games_played + 1,
          correct_answers: existingStats.correct_answers + (correct || 0),
          total_answers: existingStats.total_answers + (total || 0),
          best_streak: newBestStreak,
          best_score: newBestScore,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      // Check for new achievements
      const updatedStats = {
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        games_played: existingStats.games_played + 1,
        correct_answers: existingStats.correct_answers + (correct || 0),
        total_answers: existingStats.total_answers + (total || 0),
        best_streak: newBestStreak,
        best_score: newBestScore,
      }

      const { data: existingAchievements } = await supabase
        .from("player_achievements")
        .select("achievement_id")
        .eq("user_id", user.id)

      const unlockedIds = new Set((existingAchievements || []).map((a) => a.achievement_id))
      const newAchievements: string[] = []

      for (const achievement of ACHIEVEMENTS) {
        if (!unlockedIds.has(achievement.id) && achievement.check(updatedStats)) {
          await supabase.from("player_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
          })
          newAchievements.push(achievement.name)
        }
      }

      return NextResponse.json({
        success: true,
        xpEarned,
        totalXp: newXp,
        level: newLevel,
        streak: newStreak,
        newAchievements,
      })
    } else {
      // First time playing - create stats
      const displayName = user.email?.split("@")[0] || "Student"
      const newXp = xpEarned
      const newLevel = calculateLevel(newXp)

      await supabase.from("player_stats").insert({
        user_id: user.id,
        display_name: displayName,
        xp: newXp,
        level: newLevel,
        streak: 1,
        last_played_date: today,
        games_played: 1,
        correct_answers: correct || 0,
        total_answers: total || 0,
        best_streak: correct || 0,
        best_score: score || 0,
      })

      // Check first game achievement
      await supabase.from("player_achievements").insert({
        user_id: user.id,
        achievement_id: "first_game",
      })

      return NextResponse.json({
        success: true,
        xpEarned,
        totalXp: newXp,
        level: newLevel,
        streak: 1,
        newAchievements: ["First Steps"],
      })
    }
  } catch (error) {
    console.error("Save game result error:", error)
    return NextResponse.json({ error: "Failed to save game result" }, { status: 500 })
  }
}
