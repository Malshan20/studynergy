import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create subscription
    let { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code === "PGRST116") {
      // Not found, create free plan subscription
      const { data: newSub, error: createError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_type: "free",
          status: "active",
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error creating subscription:", createError)
        return NextResponse.json(
          { error: "Failed to create subscription" },
          { status: 500 }
        )
      }

      subscription = newSub
    } else if (error) {
      console.error("[v0] Error fetching subscription:", error)
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("[v0] Subscription error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
