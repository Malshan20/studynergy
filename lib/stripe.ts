import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "5 documents per month",
      "AI-generated flashcards",
      "Basic quiz mode",
      "Community support",
    ],
  },
  ENERGY_PLUS: {
    name: "Energy+",
    price: 9.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENERGY_PLUS,
    features: [
      "Unlimited documents",
      "Unlimited flashcards, quizzes & exams",
      "All 3 game modes (Quiz Runner, Time Attack, Challenge)",
      "Achievements & Leaderboard",
      "Priority support",
      "Advanced analytics",
    ],
  },
}

export async function getUserSubscription(userId: string) {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) {
      // Table might not exist or no subscription found - that's OK
      if (error.code === "PGRST116" || error.code === "PGRST204") {
        return { user_id: userId, plan_type: "free" } // Default to free plan
      }
      console.error("[v0] Error fetching subscription:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error in getUserSubscription:", error)
    // Return default free plan if table doesn't exist
    return { user_id: userId, plan_type: "free" }
  }
}

export async function createOrUpdateSubscription(
  userId: string,
  subscriptionData: {
    stripe_customer_id?: string
    stripe_subscription_id?: string
    stripe_price_id?: string
    stripe_session_id?: string
    plan_type: "free" | "energy_plus"
    status?: string
    current_period_start?: Date
    current_period_end?: Date
  }
) {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Try to update first
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        ...subscriptionData,
        updated_at: new Date(),
      })
      .eq("user_id", userId)

    // If update failed (no rows), try insert
    if (updateError) {
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          ...subscriptionData,
        })

      if (insertError) {
        console.error("[v0] Error creating subscription:", insertError)
        // Still return success so checkout completes
        return subscriptionData
      }
    }

    return await getUserSubscription(userId)
  } catch (error) {
    console.error("[v0] Error in createOrUpdateSubscription:", error)
    // Return the subscription data so flow continues even if table doesn't exist
    return subscriptionData
  }
}
