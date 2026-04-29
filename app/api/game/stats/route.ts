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

    // Get player stats
    const { data: stats } = await supabase
      .from("player_stats")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // Get achievements
    const { data: achievements } = await supabase
      .from("player_achievements")
      .select("*")
      .eq("user_id", user.id)

    // Get recent game sessions
    const { data: sessions } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    return NextResponse.json({
      stats: stats || {
        xp: 0,
        level: 1,
        streak: 0,
        games_played: 0,
        correct_answers: 0,
        total_answers: 0,
        best_streak: 0,
        best_score: 0,
      },
      achievements: (achievements || []).map((a) => a.achievement_id),
      sessions: sessions || [],
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
