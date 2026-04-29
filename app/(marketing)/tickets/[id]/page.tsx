"use client"

import { useEffect, useState, FormEvent, useRef } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Send, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface Message {
  id: string
  ticket_number: string
  name: string
  email: string
  subject: string
  message: string
  is_admin_reply: boolean
  created_at: string
}

interface TicketData {
  ticket: Message
  messages: Message[]
  replyCount: number
}

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = params.id as string
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${ticketId}`)

        if (!res.ok) {
          throw new Error("Failed to fetch ticket")
        }

        const data: TicketData = await res.json()
        setTicket(data)
        setMessages(data.messages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const handleSubmitReply = async (e: FormEvent) => {
    e.preventDefault()

    if (!replyText.trim() || !ticket) return

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText,
          name: ticket.ticket.name,
          email: ticket.ticket.email,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to send reply")
      }

      const { reply } = await res.json()
      setMessages([...messages, reply])
      setReplyText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  if (error || !ticket) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/tickets">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-800">{error || "Ticket not found"}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-6 md:py-8 flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/tickets">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ticket #{ticket.ticket.ticket_number}</p>
              <h1 className="text-3xl md:text-4xl font-bold">{ticket.ticket.subject}</h1>
              <p className="text-muted-foreground mt-2">{ticket.ticket.name}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg w-fit">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium capitalize">{ticket.ticket.status}</span>
            </div>
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 bg-secondary rounded-lg p-4 md:p-6 mb-4 overflow-y-auto space-y-4 flex flex-col"
        >
          {messages.map((msg, index) => {
            const isAdminReply = msg.is_admin_reply
            const isOriginal = msg.id === ticket.ticket.id

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${isAdminReply ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                    isAdminReply
                      ? "bg-background border border-border rounded-bl-none"
                      : "bg-primary text-primary-foreground rounded-br-none"
                  }`}
                >
                  {isOriginal && (
                    <p className="text-xs opacity-75 mb-2 font-semibold">
                      {isAdminReply ? "Support Team" : "You"}
                    </p>
                  )}
                  <p className="text-sm md:text-base break-words whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-2 ${isAdminReply ? "text-muted-foreground" : "opacity-75"}`}>
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )
          })}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Reply Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmitReply}
          className="space-y-3"
        >
          <Textarea
            placeholder="Type your reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="resize-none focus:ring-2"
            rows={3}
          />
          <Button
            type="submit"
            disabled={!replyText.trim() || isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Reply
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </main>
  )
}
