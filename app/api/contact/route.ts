import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Generate unique ticket number
    const ticketNumber = `STN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Use a direct client (no cookie auth) so RLS anon policy works for unauthenticated visitors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        ticket_number: ticketNumber,
        name,
        email,
        subject,
        message,
        status: "open",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving contact message:", error)
      return NextResponse.json(
        { error: "Failed to submit message" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      ticketNumber: data.ticket_number,
      message: "Message sent successfully! We'll respond within 24-48 hours." 
    })
  } catch (error) {
    console.error("[v0] Contact API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
