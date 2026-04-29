"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "Forever",
    description: "Perfect for getting started with AI-powered studying",
    features: [
      { text: "5 documents per month", included: true },
      { text: "AI-generated flashcards", included: true },
      { text: "Basic quiz mode", included: true },
      { text: "Community support", included: true },
      { text: "Unlimited game modes", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaHref: "/dashboard",
    highlighted: false,
  },
  {
    id: "energy_plus",
    name: "Energy+",
    price: "$9.99",
    period: "per month",
    description: "Unlimited everything. Perfect for serious students",
    features: [
      { text: "Unlimited documents", included: true },
      { text: "Unlimited flashcards, quizzes & exams", included: true },
      { text: "All 3 game modes", included: true },
      { text: "Achievements & Leaderboard", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "No ads", included: true },
    ],
    cta: "Upgrade Now",
    highlighted: true,
  },
]

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()

      if (url) {
        router.push(url)
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to start checkout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to supercharge your studying with AI-powered
            tools and gamified learning
          </p>
        </motion.div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? "md:scale-105 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary shadow-lg"
                  : "bg-card border border-border hover:border-primary/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Plan Header */}
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm md:text-base">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm md:text-base">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={
                    plan.id === "energy_plus" ? handleCheckout : undefined
                  }
                  disabled={isLoading && plan.id === "energy_plus"}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  {plan.id === "energy_plus" && isLoading
                    ? "Loading..."
                    : plan.cta}
                </button>

                {plan.id === "free" && (
                  <Link href={plan.ctaHref} className="block">
                    <Button className="w-full" variant="outline">
                      {plan.cta}
                    </Button>
                  </Link>
                )}

                {/* Features List */}
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + featureIndex * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`flex-shrink-0 mt-1 ${
                          feature.included
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-sm md:text-base ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: "Can I switch plans anytime?",
              a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit and debit cards through Stripe.",
            },
            {
              q: "Is there a free trial for Energy+?",
              a: "We offer a 14-day free trial when you upgrade to Energy+. Cancel anytime before the trial ends.",
            },
            {
              q: "Can I cancel my subscription?",
              a: "Yes, you can cancel anytime in your account settings. Your access continues until the end of your billing period.",
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
