"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [isError, setIsError] = useState(false)

  const sessionId = searchParams.get("session_id")
  const userId = searchParams.get("user_id")

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId || !userId) {
        setIsError(true)
        setIsProcessing(false)
        return
      }

      try {
        const response = await fetch("/api/stripe/success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to process subscription")
        }

        // Wait a moment to ensure database is updated
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setIsProcessing(false)
      } catch (error) {
        console.error("Payment processing error:", error)
        setIsError(true)
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [sessionId, userId])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Processing Your Payment
          </h1>
          <p className="text-muted-foreground">
            Please wait while we activate your Energy+ plan...
          </p>
        </motion.div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-8">
            We had trouble processing your payment. Please try again or contact
            support.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <Button className="w-full">Try Again</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Welcome to Energy+!
        </h1>

        <p className="text-muted-foreground mb-2">
          Your payment has been processed successfully.
        </p>

        <div className="bg-card border border-primary/20 rounded-lg p-6 my-8">
          <h2 className="font-semibold mb-3">Your benefits:</h2>
          <ul className="text-left space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Unlimited documents and study materials</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>All game modes unlocked</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Advanced achievements & leaderboard</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        <p className="text-muted-foreground text-sm mb-8">
          A confirmation email has been sent to your email address.
        </p>

        <Link href="/dashboard">
          <Button className="w-full" size="lg">
            Go to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
