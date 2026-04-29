"use client"

import { useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import gsap from "gsap"
import { Upload, Cpu, Sparkles, Gamepad2 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Material",
    description: "Drop your PDFs, notes, or text. Studynergy accepts any study material you have.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Processes Content",
    description: "Our agentic AI analyzes your document, extracting key concepts and important information.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get Study Tools",
    description: "Instantly receive flashcards, summaries, quizzes, and mock exams - all in one click.",
  },
  {
    number: "04",
    icon: Gamepad2,
    title: "Learn & Play",
    description: "Study with your materials or jump into Game Mode to compete and earn XP while learning.",
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isInView && lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, ease: "power2.out", delay: 0.5 }
      )
    }
  }, [isInView])

  return (
    <section ref={ref} className="py-20 md:py-32 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How Studynergy Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            From Document to{" "}
            <span className="gradient-text">Study Ready</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Four simple steps to transform your study routine forever.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - hidden on mobile */}
          <div
            ref={lineRef}
            className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gradient-to-r from-primary via-accent to-primary -translate-y-1/2 origin-left rounded-full"
            style={{ transform: "translateY(-50%) scaleX(0)" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Card */}
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="relative bg-card border border-border/50 rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Step Number */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg"
                  >
                    {step.number}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4 mt-2"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <step.icon className="w-8 h-8 text-primary" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Arrow connector - visible on mobile between cards */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 lg:hidden">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={isInView ? { scaleY: 1 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="w-0.5 h-8 bg-gradient-to-b from-primary to-accent rounded-full origin-top"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
