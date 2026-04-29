"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get top 50 players by XP
    const { data: topPlayers } = await supabase
      .from("player_stats")
      .select("user_id, display_name, xp, level, games_played, correct_answers, total_answers, best_streak, best_score, streak")
      .order("xp", { ascending: false })
      .limit(50)

    // Find current user's rank
    const { count } = await supabase
      .from("player_stats")
      .select("*", { count: "exact", head: true })

    const { data: userStats } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", user.id)
      .single()

    let userRank = null
    if (userStats && topPlayers) {
      const idx = topPlayers.findIndex((p) => p.user_id === user.id)
      userRank = idx !== -1 ? idx + 1 : null
    }

    return NextResponse.json({
      leaderboard: topPlayers || [],
      totalPlayers: count || 0,
      currentUser: {
        userId: user.id,
        stats: userStats || null,
        rank: userRank,
      },
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to get leaderboard" }, { status: 500 })
  }
}
