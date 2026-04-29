"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Zap, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-destructive/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "-2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl shadow-destructive/5 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Studynergy</span>
          </div>

          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-10 h-10 text-destructive" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-2">
              We encountered an error while processing your request.
            </p>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg mb-6">
                Error: {error}
              </p>
            )}

            <Link href="/auth/login">
              <Button className="w-full h-12 rounded-xl text-base group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
