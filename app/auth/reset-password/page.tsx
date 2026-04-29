"use client"

import React, { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Loader2, ShieldCheck, AlertCircle, Eye, EyeOff } from "lucide-react"

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const labels = ["", "Weak", "Fair", "Good", "Strong"]
  const colors = ["bg-border", "bg-destructive", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-border"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium transition-colors ${strength <= 1 ? "text-destructive" : strength === 2 ? "text-yellow-500" : strength === 3 ? "text-blue-500" : "text-green-500"}`}>
        {strength > 0 ? labels[strength] : ""}
      </p>
    </div>
  )
}

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Supabase sends the session tokens in the URL hash — exchange them on mount
  useEffect(() => {
    const supabase = createClient()

    // Listen for the PASSWORD_RECOVERY event which fires when the reset link is used
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true)
      }
    })

    // Also handle the case where the token is already in the URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      // Redirect to dashboard after 3 seconds
      setTimeout(() => router.push("/dashboard"), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please request a new reset link.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "-2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-xl shadow-primary/5">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Studynergy</span>
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              /* Success */
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto mb-5">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-3">Password updated!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Your password has been successfully reset. You&apos;re being redirected to your dashboard...
                </p>
                <Link href="/dashboard">
                  <Button className="w-full h-11 rounded-xl">Go to Dashboard</Button>
                </Link>
              </motion.div>
            ) : (
              /* Form */
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">Set new password</h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Choose a strong password you haven&apos;t used before.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* New password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl pr-12"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={password} />
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm new password</Label>
                    <div className="relative">
                      <Input
                        id="confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`h-12 rounded-xl pr-12 transition-colors ${passwordsMismatch ? "border-destructive focus-visible:ring-destructive/30" : passwordsMatch ? "border-green-500 focus-visible:ring-green-500/30" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {passwordsMatch && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-green-500 font-medium">
                          Passwords match
                        </motion.p>
                      )}
                      {passwordsMismatch && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-destructive font-medium">
                          Passwords do not match
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Requirements hint */}
                  <ul className="text-xs text-muted-foreground space-y-1 px-1">
                    {[
                      { label: "At least 8 characters", ok: password.length >= 8 },
                      { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
                      { label: "One number", ok: /[0-9]/.test(password) },
                      { label: "One special character", ok: /[^A-Za-z0-9]/.test(password) },
                    ].map(({ label, ok }) => (
                      <li key={label} className={`flex items-center gap-2 transition-colors ${password.length > 0 ? (ok ? "text-green-500" : "text-muted-foreground") : ""}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${password.length > 0 ? (ok ? "bg-green-500" : "bg-muted-foreground/40") : "bg-muted-foreground/40"}`} />
                        {label}
                      </li>
                    ))}
                  </ul>

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
                    disabled={isLoading || !sessionReady || passwordsMismatch || password.length < 8}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>

                  {!sessionReady && (
                    <p className="text-xs text-center text-muted-foreground">
                      Waiting for your reset session to load...
                    </p>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
