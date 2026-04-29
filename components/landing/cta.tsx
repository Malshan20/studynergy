"use client"

import { useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Trophy, Gamepad2 } from "lucide-react"
import Link from "next/link"

export function CTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const blobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!blobRef.current) return
    
    const ctx = gsap.context(() => {
      gsap.to(".cta-blob-1", {
        x: 30,
        y: -20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to(".cta-blob-2", {
        x: -30,
        y: 20,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, blobRef)

    return () => ctx.revert()
  }, [])

  const features = [
    { icon: Zap, label: "Instant AI Generation" },
    { icon: Gamepad2, label: "Game Mode" },
    { icon: Trophy, label: "Achievements" },
  ]

  return (
    <section ref={ref} className="py-20 md:py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div
          ref={blobRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-accent/90 p-8 md:p-16 text-center"
        >
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="cta-blob-1 absolute -top-20 -left-20 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="cta-blob-2 absolute -bottom-20 -right-20 w-48 h-48 md:w-80 md:h-80 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Join thousands of students</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-balance"
            >
              Ready to Transform
              <br />
              Your Study Game?
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white/90 text-lg mb-6 max-w-xl mx-auto text-pretty"
            >
              Start using Studynergy today. Upload your first document and see the magic of AI-powered learning.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-8"
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm"
                >
                  <feature.icon className="w-4 h-4 text-white" />
                  <span className="text-sm text-white/90">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-base px-8 py-6 rounded-full group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-base px-8 py-6 rounded-full bg-transparent"
                >
                  See Features
                </Button>
              </Link>
            </motion.div>

            {/* Trust text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-white/60 text-sm mt-6"
            >
              Free forever. No credit card required. Start studying smarter today.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
