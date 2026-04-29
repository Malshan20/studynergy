import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get parent ticket
    const { data: parentTicket, error: parentError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", ticketId)
      .single()

    if (parentError || !parentTicket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
    }

    // Get all replies to this ticket (ordered by created_at)
    const { data: replies, error: repliesError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("parent_id", ticketId)
      .order("created_at", { ascending: true })

    if (repliesError) {
      console.error("[v0] Error fetching replies:", repliesError)
      return NextResponse.json(
        { error: "Failed to fetch ticket details" },
        { status: 500 }
      )
    }

    // Combine parent ticket with all replies
    const allMessages = [
      parentTicket,
      ...(replies || [])
    ]

    return NextResponse.json({
      ticket: parentTicket,
      messages: allMessages,
      replyCount: replies?.length || 0
    })
  } catch (error) {
    console.error("[v0] Error in ticket detail API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
