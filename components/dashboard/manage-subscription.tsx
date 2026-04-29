'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManageSubscription = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={loading}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          Manage Subscription
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </Button>
  )
}
