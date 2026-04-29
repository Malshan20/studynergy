import { NextResponse } from "next/server"
import { stripe, createOrUpdateSubscription } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { sessionId, userId } = await request.json()

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session.subscription) {
      return NextResponse.json(
        { error: "No subscription in session" },
        { status: 400 }
      )
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    // Update user subscription in database
    const subscriptionResult = await createOrUpdateSubscription(userId, {
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      stripe_session_id: sessionId,
      plan_type: "energy_plus",
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })

    // Success even if DB update fails (subscription was created in Stripe)
    return NextResponse.json({ 
      success: true,
      subscription: subscriptionResult
    })
  } catch (error) {
    console.error("[v0] Success handler error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process subscription" },
      { status: 500 }
    )
  }
}
