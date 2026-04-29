'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DashboardNav } from '@/components/dashboard/nav'
import { ArrowRight, CreditCard, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          // Fetch subscription
          const res = await fetch('/api/user/subscription')
          if (res.ok) {
            const data = await res.json()
            setSubscription(data.subscription)
          }
        }
      } catch (error) {
        console.error('[v0] Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal-session', {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('[v0] Portal error:', error)
      alert('Failed to open subscription manager. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {user && <DashboardNav user={user} />}
        <div className="flex items-center justify-center h-[calc(100vh-70px)]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <DashboardNav user={user} />}

      <main className="max-w-4xl mx-auto p-4 md:p-6 py-8 md:py-12">
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-balance">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account and subscription</p>
          </motion.div>

          {/* Account Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 md:p-8 border-border/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">👤</span>
                </div>
                Account Information
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="px-4 py-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <div className="px-4 py-3 rounded-lg bg-secondary/50 border border-border/50 font-mono text-sm">
                    <p className="break-all text-foreground/80">{user?.id}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <div className="px-4 py-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="font-medium">
                      {new Date(user?.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Subscription Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 md:p-8 border-border/50 bg-gradient-to-br from-primary/5 to-primary/0">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                Subscription Plan
              </h2>

              <div className="space-y-4">
                {/* Plan Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                    <span className="font-semibold text-sm">
                      {subscription?.plan_type === 'energy_plus' ? 'Energy+ Pro' : 'Free'}
                    </span>
                  </div>
                </div>

                {/* Plan Description */}
                {subscription?.plan_type === 'energy_plus' ? (
                  <div className="mt-4 p-4 rounded-lg bg-background/50 border border-primary/20">
                    <p className="text-sm text-foreground">
                      You have <span className="font-semibold text-primary">unlimited access</span> to all Studynergy features including unlimited study materials, game modes, and XP earning.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-sm text-foreground">
                      You're on the free plan with basic access. <Link href="/pricing" className="font-semibold text-primary hover:underline">Upgrade to Energy+</Link> for unlimited features.
                    </p>
                  </div>
                )}

                {/* Manage Button */}
                {subscription?.plan_type === 'energy_plus' && (
                  <div className="pt-4">
                    <Button
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      className="w-full md:w-auto"
                    >
                      {portalLoading ? 'Loading...' : 'Manage Subscription'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {subscription?.plan_type === 'free' && (
                  <div className="pt-4">
                    <Link href="/pricing">
                      <Button className="w-full md:w-auto">
                        Upgrade to Energy+
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 md:p-8 border-destructive/20 bg-destructive/5">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-destructive">
                <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                Danger Zone
              </h2>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign out from your account on this device.
                </p>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full md:w-auto"
                >
                  Sign Out
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
