"use client"

import { useSubscription } from "@/hooks/useSubscription"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function UpgradeButton() {
  const { subscription, isLoading, isPremium } = useSubscription()

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">Energy+ Active</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href="/pricing">
        <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <Zap className="w-4 h-4" />
          Upgrade to Energy+
        </Button>
      </Link>
    </motion.div>
  )
}
