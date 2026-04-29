"use client"

import { motion } from "framer-motion"
import { BookOpen, Gamepad2, ChevronRight, Clock, Swords, Car } from "lucide-react"
import Link from "next/link"

interface StudyModeSelectorProps {
  documentId?: string
}

export function StudyModeSelector({ documentId }: StudyModeSelectorProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-card to-secondary/20 border border-border/50">
      <h3 className="text-lg font-bold mb-1">Choose Your Study Mode</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select how you want to learn today
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Standard Study Mode */}
        <Link
          href={documentId ? `/dashboard/study-materials?doc=${documentId}` : "/dashboard/study-materials"}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 cursor-pointer group hover:border-blue-500/40 transition-colors h-full"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-semibold mb-1">Standard Study</h4>
            <p className="text-xs text-muted-foreground">
              Flashcards, summaries, quizzes and mock exams
            </p>
          </motion.div>
        </Link>

        {/* Game Mode Hub */}
        <Link href="/game">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 cursor-pointer group hover:border-primary/40 transition-colors relative overflow-hidden h-full"
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-bold text-primary uppercase tracking-wide">
              3 Modes
            </div>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-semibold mb-1">Game Modes</h4>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-semibold text-blue-500">
                <Car className="w-3 h-3" /> Quiz Runner
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-semibold text-amber-500">
                <Clock className="w-3 h-3" /> Time Attack
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-[10px] font-semibold text-red-500">
                <Swords className="w-3 h-3" /> Challenge
              </span>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
