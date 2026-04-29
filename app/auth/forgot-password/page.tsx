"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, ArrowLeft, Loader2, MailCheck, AlertCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "-2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl shadow-primary/5">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Studynergy</span>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* Success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-5">
                  <MailCheck className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Check your inbox</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  We sent a password reset link to
                </p>
                <p className="font-semibold text-foreground mb-5">{email}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Click the link in the email to reset your password. If you don&apos;t see it, check your spam folder.
                </p>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl bg-transparent"
                    onClick={() => { setSent(false); setEmail("") }}
                  >
                    Try a different email
                  </Button>
                  <Link href="/auth/login">
                    <Button className="w-full h-11 rounded-xl">
                      Back to sign in
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Form state */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No worries. Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl"
                      autoFocus
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-3 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
