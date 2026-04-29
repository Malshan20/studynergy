import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Use anon client so unauthenticated users can search tickets
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all tickets for this email
    const { data: tickets, error } = await supabase
      .from("contact_messages")
      .select("id, ticket_number, name, email, subject, status, created_at, updated_at")
      .eq("email", email)
      .is("parent_id", null) // Only get parent messages (not replies)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching tickets:", error)
      return NextResponse.json(
        { error: "Failed to fetch tickets" },
        { status: 500 }
      )
    }

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("[v0] Error in tickets API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
