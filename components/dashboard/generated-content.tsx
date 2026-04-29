"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Layers,
  FileText,
  BookCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react"

interface GeneratedContentProps {
  content: {
    flashcards: Array<{ question: string; answer: string }>
    summary: { content: string; keyPoints: string[] }
    quiz: Array<{ question: string; options: string[]; correctAnswer: number }>
    mockExam: Array<{ question: string; options: string[]; correctAnswer: number }>
  }
  documentTitle: string
}

export function GeneratedContent({ content, documentTitle }: GeneratedContentProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({})
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [showExamResults, setShowExamResults] = useState(false)

  const toggleFlip = (index: number) => {
    const newFlipped = new Set(flippedCards)
    if (newFlipped.has(index)) {
      newFlipped.delete(index)
    } else {
      newFlipped.add(index)
    }
    setFlippedCards(newFlipped)
  }

  const nextFlashcard = () => {
    setCurrentFlashcard((prev) => (prev + 1) % content.flashcards.length)
    setFlippedCards(new Set())
  }

  const prevFlashcard = () => {
    setCurrentFlashcard((prev) => (prev - 1 + content.flashcards.length) % content.flashcards.length)
    setFlippedCards(new Set())
  }

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (showQuizResults) return
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const handleExamAnswer = (questionIndex: number, answerIndex: number) => {
    if (showExamResults) return
    setExamAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }))
  }

  const calculateScore = (answers: Record<number, number>, questions: Array<{ correctAnswer: number }>) => {
    let correct = 0
    Object.entries(answers).forEach(([index, answer]) => {
      if (questions[Number(index)]?.correctAnswer === answer) {
        correct++
      }
    })
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) }
  }

  const resetQuiz = () => {
    setQuizAnswers({})
    setShowQuizResults(false)
  }

  const resetExam = () => {
    setExamAnswers({})
    setShowExamResults(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-border/50">
        <h2 className="text-xl font-semibold">{documentTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">Your AI-generated study materials are ready</p>
      </div>

      <Tabs defaultValue="flashcards" className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Flashcards</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {content.flashcards.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 flex items-center gap-2"
            >
              <BookCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {content.quiz.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="exam"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Mock Exam</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {content.mockExam.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Flashcards */}
        <TabsContent value="flashcards" className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Card {currentFlashcard + 1} of {content.flashcards.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevFlashcard} className="rounded-full bg-transparent">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextFlashcard} className="rounded-full bg-transparent">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <motion.div
              key={currentFlashcard}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => toggleFlip(currentFlashcard)}
              className="relative h-64 md:h-80 cursor-pointer perspective-1000"
            >
              <AnimatePresence mode="wait">
                {!flippedCards.has(currentFlashcard) ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: -180 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center backface-hidden"
                  >
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Question</span>
                    <p className="text-lg md:text-xl font-medium">{content.flashcards[currentFlashcard].question}</p>
                    <span className="text-xs text-muted-foreground mt-6">Tap to reveal answer</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: -180 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 180 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center backface-hidden"
                  >
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Answer</span>
                    <p className="text-lg md:text-xl font-medium">{content.flashcards[currentFlashcard].answer}</p>
                    <span className="text-xs text-muted-foreground mt-6">Tap to see question</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </TabsContent>

        {/* Summary */}
        <TabsContent value="summary" className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="prose prose-sm max-w-none">
              <div className="bg-secondary/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {content.summary.content}
                </p>
              </div>
            </div>

            {content.summary.keyPoints.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Key Points
                </h3>
                <ul className="space-y-3">
                  {content.summary.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Quiz */}
        <TabsContent value="quiz" className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {showQuizResults && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center"
              >
                <h3 className="text-2xl font-bold mb-2">
                  {calculateScore(quizAnswers, content.quiz).percentage}%
                </h3>
                <p className="text-muted-foreground mb-4">
                  You got {calculateScore(quizAnswers, content.quiz).correct} out of {calculateScore(quizAnswers, content.quiz).total} correct
                </p>
                <Button onClick={resetQuiz} variant="outline" className="rounded-full bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
            )}

            {content.quiz.map((question, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
                className="bg-secondary/30 rounded-xl p-6"
              >
                <p className="font-medium mb-4">
                  {qIndex + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    const isSelected = quizAnswers[qIndex] === oIndex
                    const isCorrect = question.correctAnswer === oIndex
                    const showResult = showQuizResults

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleQuizAnswer(qIndex, oIndex)}
                        disabled={showQuizResults}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          showResult
                            ? isCorrect
                              ? "bg-green-500/10 border-green-500/30"
                              : isSelected
                              ? "bg-destructive/10 border-destructive/30"
                              : "bg-card border-border/50"
                            : isSelected
                            ? "bg-primary/10 border-primary/30"
                            : "bg-card border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{option}</span>
                          {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ))}

            {!showQuizResults && Object.keys(quizAnswers).length === content.quiz.length && (
              <Button onClick={() => setShowQuizResults(true)} className="w-full rounded-xl h-12">
                Submit Quiz
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Mock Exam */}
        <TabsContent value="exam" className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {showExamResults && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center"
              >
                <h3 className="text-2xl font-bold mb-2">
                  {calculateScore(examAnswers, content.mockExam).percentage}%
                </h3>
                <p className="text-muted-foreground mb-4">
                  You got {calculateScore(examAnswers, content.mockExam).correct} out of {calculateScore(examAnswers, content.mockExam).total} correct
                </p>
                <Button onClick={resetExam} variant="outline" className="rounded-full bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Exam
                </Button>
              </motion.div>
            )}

            {content.mockExam.map((question, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: qIndex * 0.1 }}
                className="bg-secondary/30 rounded-xl p-6"
              >
                <p className="font-medium mb-4">
                  {qIndex + 1}. {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => {
                    const isSelected = examAnswers[qIndex] === oIndex
                    const isCorrect = question.correctAnswer === oIndex
                    const showResult = showExamResults

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleExamAnswer(qIndex, oIndex)}
                        disabled={showExamResults}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          showResult
                            ? isCorrect
                              ? "bg-green-500/10 border-green-500/30"
                              : isSelected
                              ? "bg-destructive/10 border-destructive/30"
                              : "bg-card border-border/50"
                            : isSelected
                            ? "bg-primary/10 border-primary/30"
                            : "bg-card border-border/50 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{option}</span>
                          {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ))}

            {!showExamResults && Object.keys(examAnswers).length === content.mockExam.length && (
              <Button onClick={() => setShowExamResults(true)} className="w-full rounded-xl h-12">
                Submit Exam
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
