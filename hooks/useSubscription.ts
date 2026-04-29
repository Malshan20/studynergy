import { useEffect, useState } from "react"

interface Subscription {
  id: string
  user_id: string
  plan_type: "free" | "energy_plus"
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/user/subscription")
        if (!response.ok) {
          throw new Error("Failed to fetch subscription")
        }
        const data = await response.json()
        setSubscription(data.subscription)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        // Default to free plan if error
        setSubscription({
          id: "",
          user_id: "",
          plan_type: "free",
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: null,
          status: "active",
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const isPremium = subscription?.plan_type === "energy_plus"

  return { subscription, isLoading, error, isPremium }
}
