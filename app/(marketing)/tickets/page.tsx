"use client"

import { useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { Search, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Ticket {
  id: string
  ticket_number: string
  name: string
  email: string
  subject: string
  status: string
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  open: { icon: <AlertCircle className="w-4 h-4" />, label: "Open", color: "bg-blue-100 text-blue-800" },
  in_progress: { icon: <Clock className="w-4 h-4" />, label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  resolved: { icon: <CheckCircle className="w-4 h-4" />, label: "Resolved", color: "bg-green-100 text-green-800" },
  closed: { icon: <CheckCircle className="w-4 h-4" />, label: "Closed", color: "bg-gray-100 text-gray-800" },
}

export default function TicketsPage() {
  const [email, setEmail] = useState("")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/tickets?email=${encodeURIComponent(email)}`)

      if (!res.ok) {
        throw new Error("Failed to fetch tickets")
      }

      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Tickets</h1>
          <p className="text-lg text-muted-foreground">
            Search for your support tickets using your email address
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-base"
                required
              />
            </div>
            <Button type="submit" className="h-12 px-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* No Results */}
        {searched && tickets.length === 0 && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg text-muted-foreground mb-6">No tickets found for this email</p>
            <Link href="/contact">
              <Button variant="outline">Create a new ticket</Button>
            </Link>
          </motion.div>
        )}

        {/* Tickets List */}
        {tickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold mb-6">Your Tickets ({tickets.length})</h2>
            {tickets.map((ticket, index) => {
              const status = statusConfig[ticket.status] || statusConfig.open
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <Link href={`/tickets/${ticket.id}`} className="block">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {ticket.ticket_number}
                          </span>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold truncate mb-1">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground">{ticket.name}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{new Date(ticket.created_at).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </motion.div>
        )}
      </div>
    </main>
  )
}
