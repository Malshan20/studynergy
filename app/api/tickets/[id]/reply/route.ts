import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params
    const { message, name, email } = await request.json()

    if (!message || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get parent ticket to get its ticket_number
    const { data: parentTicket, error: parentError } = await supabase
      .from("contact_messages")
      .select("ticket_number")
      .eq("id", ticketId)
      .single()

    if (parentError || !parentTicket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
    }

    // Generate a unique ticket number for this reply
    const replyTicketNumber = `${parentTicket.ticket_number}-R${Date.now().toString(36).toUpperCase()}`

    // Add reply
    const { data: reply, error: replyError } = await supabase
      .from("contact_messages")
      .insert({
        ticket_number: replyTicketNumber,
        name,
        email,
        subject: `Re: ${parentTicket.ticket_number}`,
        message,
        parent_id: ticketId,
        status: "open",
        is_admin_reply: false,
      })
      .select()
      .single()

    if (replyError) {
      console.error("[v0] Error adding reply:", replyError)
      return NextResponse.json(
        { error: "Failed to add reply" },
        { status: 500 }
      )
    }

    // Update parent ticket's updated_at
    await supabase
      .from("contact_messages")
      .update({ updated_at: new Date() })
      .eq("id", ticketId)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("[v0] Error in ticket reply API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
