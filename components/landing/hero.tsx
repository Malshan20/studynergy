"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Gamepad2, Trophy, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const blobsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate floating blobs
      gsap.to(".blob-1", {
        x: 50,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to(".blob-2", {
        x: -40,
        y: 40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to(".blob-3", {
        x: 30,
        y: 50,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Animate hero image
      gsap.to(".hero-image", {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20 md:py-32"
    >
      {/* Animated Background Blobs */}
      <div ref={blobsRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob-1 absolute top-10 left-10 md:top-20 md:left-20 w-48 h-48 md:w-72 md:h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="blob-2 absolute top-40 right-10 md:top-40 md:right-20 w-56 h-56 md:w-96 md:h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="blob-3 absolute bottom-10 left-1/3 w-40 h-40 md:w-80 md:h-80 bg-chart-3/20 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Study Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 text-balance"
            >
              Study Smarter,
              <br />
              <span className="gradient-text">Not Harder</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 text-pretty"
            >
              Upload your documents and let Studynergy AI instantly create flashcards, summaries, quizzes, and mock exams. 
              Learn through gamified experiences and track your progress.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full group">
                  Start Learning Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full bg-transparent">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8"
            >
              {[
                { icon: Zap, label: "Instant Generation" },
                { icon: Gamepad2, label: "Game Mode" },
                { icon: Trophy, label: "Achievements" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="hero-image relative w-full max-w-lg">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl blur-3xl scale-90" />
              
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl shadow-primary/10">
                <Image
                  src="/images/hero-student.jpg"
                  alt="Student using Studynergy"
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -left-4 md:-left-12 top-1/4 bg-card border border-border/50 rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">AI Generated</p>
                    <p className="text-xs text-muted-foreground">50 Flashcards</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -right-4 md:-right-8 bottom-1/4 bg-card border border-border/50 rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Level Up!</p>
                    <p className="text-xs text-muted-foreground">+250 XP</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-16 mt-16 md:mt-24 pt-8 border-t border-border/50"
        >
          {[
            { label: "Study Tools", value: "4+", desc: "Flashcards, Quizzes, Summaries, Exams" },
            { label: "Game Modes", value: "3", desc: "Quiz Runner, Time Attack, Challenge" },
            { label: "Free Forever", value: "100%", desc: "No credit card required" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm font-medium mt-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
