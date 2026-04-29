import { NextResponse } from "next/server"
import { stripe, PLANS } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const priceId = PLANS.ENERGY_PLUS.priceId

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 500 }
      )
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user.id}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    )
  }
}
