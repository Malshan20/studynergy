'use client';

import { motion } from "framer-motion"
import { Zap, Users, Target, Heart, Sparkles, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Innovation First",
      description: "We leverage cutting-edge AI to transform how students learn and retain information.",
    },
    {
      icon: Users,
      title: "Student-Centric",
      description: "Every feature is designed with students in mind, making studying engaging and effective.",
    },
    {
      icon: Target,
      title: "Results-Driven",
      description: "Our platform is built to improve academic performance through proven learning techniques.",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "100% free forever. Quality education tools should be available to everyone.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Making Learning <span className="text-primary">Fun & Effective</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Studynergy is an AI-powered study platform that transforms your documents into
              interactive flashcards, summaries, quizzes, and games—helping students learn
              smarter, not harder.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              We believe studying shouldn't be boring or overwhelming. Studynergy was created to
              make learning engaging, personalized, and effective for every student.
            </p>
            <p className="text-muted-foreground mb-6">
              By combining artificial intelligence with gamification, we help students transform
              their study materials into interactive experiences that boost retention and make
              learning genuinely enjoyable.
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">100K+</div>
                <div className="text-sm text-muted-foreground">Study Materials Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Free Forever</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="bg-card border border-border/50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How Studynergy Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Upload Your Materials</h3>
              <p className="text-sm text-muted-foreground">
                Upload PDFs, paste notes, or type in your study content. Studynergy accepts any
                study material.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Generates Study Tools</h3>
              <p className="text-sm text-muted-foreground">
                Our AI instantly creates flashcards, summaries, quizzes, and mock exams from your
                content.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Learn & Play</h3>
              <p className="text-sm text-muted-foreground">
                Study your materials or jump into Game Mode to earn XP, unlock achievements, and
                climb the leaderboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12 text-center">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Game?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of students who are already learning smarter with Studynergy. Create
            your free account and start generating AI-powered study materials today.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
