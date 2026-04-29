"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FileText, Layers, BookCheck, GraduationCap, Gamepad2, Trophy } from "lucide-react"
import Image from "next/image"

const features = [
  {
    icon: Layers,
    title: "Smart Flashcards",
    description: "AI instantly creates flashcards from your documents. Perfect for active recall and spaced repetition learning.",
    image: "/images/feature-flashcards.jpg",
    color: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Instant Summaries",
    description: "Get comprehensive, well-structured summaries with key points highlighted. Never miss important concepts.",
    image: "/images/feature-summary.jpg",
    color: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/10 text-accent",
  },
  {
    icon: BookCheck,
    title: "Interactive Quizzes",
    description: "Test your knowledge with auto-generated quizzes. MCQ, essay, or mixed formats with instant feedback.",
    image: "/images/feature-quiz.jpg",
    color: "from-chart-3/20 to-chart-3/5",
    iconBg: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: GraduationCap,
    title: "Mock Exams",
    description: "Prepare for real exams with full-length practice tests. Timed sessions with detailed scoring.",
    image: "/images/feature-exam.jpg",
    color: "from-chart-4/20 to-chart-4/5",
    iconBg: "bg-chart-4/10 text-chart-4",
  },
  {
    icon: Gamepad2,
    title: "Game Mode",
    description: "Learn through play! Race against time, compete on leaderboards, and earn XP with our quiz runner game.",
    image: "/images/feature-gamemode.jpg",
    color: "from-chart-5/20 to-chart-5/5",
    iconBg: "bg-chart-5/10 text-chart-5",
  },
  {
    icon: Trophy,
    title: "Achievements & XP",
    description: "Track your progress with levels, badges, and achievements. Stay motivated with gamified learning.",
    image: "/images/feature-gamemode.jpg",
    color: "from-primary/20 to-accent/5",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
]

export function Features() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-secondary/30" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Everything You Need to{" "}
            <span className="gradient-text">Ace Your Exams</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Upload once, get instant study materials. Studynergy transforms your documents into powerful learning tools.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
            >
              {/* Image Section */}
              <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${feature.color}`}>
                <Image
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  fill
                  className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Content Section */}
              <div className="p-6 pt-4 relative">
                {/* Icon - positioned to overlap */}
                <div className={`absolute -top-6 left-6 inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg} border-4 border-card shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 mt-4 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            All features available for free.{" "}
            <span className="text-primary font-medium">No credit card required.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
