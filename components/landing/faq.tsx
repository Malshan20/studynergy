"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does Studynergy work?",
    answer: "Upload your study documents (PDFs or text) and Studynergy AI instantly generates flashcards, summaries, quizzes, and mock exams. You can customize the number of questions and choose between MCQ, essay, or mixed formats before generation.",
  },
  {
    question: "What is Game Mode?",
    answer: "Game Mode turns studying into a fun experience! Race through quiz questions in our Quiz Runner game, earn XP, level up, unlock achievements, and compete on leaderboards. It's learning through play - making studying less boring and more engaging.",
  },
  {
    question: "Is Studynergy free to use?",
    answer: "Yes! Studynergy is 100% free forever. Create an account, upload your documents, and start generating unlimited study materials. No credit card required, no hidden fees.",
  },
  {
    question: "Can I customize what gets generated?",
    answer: "Absolutely! Before generating, you can choose how many flashcards (5-20), quiz questions (5-15), and exam questions (5-20) you want. For exams, select between MCQ only, essay only, or mixed formats.",
  },
  {
    question: "How does the XP and leveling system work?",
    answer: "You earn XP by studying flashcards, taking quizzes, completing exams, and playing Game Mode. As you accumulate XP, you level up and unlock achievements. Track your daily streak and climb the leaderboard!",
  },
  {
    question: "What file formats are supported?",
    answer: "We support PDF files and plain text. You can either upload a PDF document or paste your study notes directly. Our AI extracts the text and generates study materials from the content.",
  },
  {
    question: "Can I access my study materials later?",
    answer: "Yes! All your generated study materials are saved to your account. Visit the Study Materials page to see your complete history of documents, flashcards, quizzes, and exams anytime.",
  },
  {
    question: "Does Studynergy work on mobile?",
    answer: "Studynergy is fully mobile-responsive! Study on your phone, tablet, or desktop. Game Mode is optimized for touch controls, so you can play and learn anywhere.",
  },
]

export function FAQ() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 md:py-32 px-4 bg-secondary/30" id="faq">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Frequently Asked{" "}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Everything you need to know about Studynergy.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5 text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
