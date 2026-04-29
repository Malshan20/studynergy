"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  BookCheck,
  GraduationCap,
  X,
} from "lucide-react"

interface GeneratedContent {
  flashcards: Array<{ question: string; answer: string }>
  summary: { content: string; keyPoints: string[] }
  quiz: Array<{ question: string; options: string[]; correctAnswer: number }>
  mockExam: Array<{ question: string; options: string[]; correctAnswer: number }>
}

interface DocumentUploaderProps {
  onGenerate: (title: string, content: string, options: GenerationOptions) => Promise<GeneratedContent>
  isGenerating: boolean
}

interface GenerationOptions {
  flashcardCount: number
  quizCount: number
  examCount: number
  examType: "mcq" | "essay" | "mixed"
}

export function DocumentUploader({ onGenerate, isGenerating }: DocumentUploaderProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("paste")
  const [showOptions, setShowOptions] = useState(false)
  
  // Generation options
  const [flashcardCount, setFlashcardCount] = useState(8)
  const [quizCount, setQuizCount] = useState(6)
  const [examCount, setExamCount] = useState(8)
  const [examType, setExamType] = useState<"mcq" | "essay" | "mixed">("mcq")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFileName(file.name)
    setTitle(file.name.replace(/\.[^/.]+$/, ""))

    // Read file content based on file type
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExt === 'pdf') {
      // For PDFs, we need to extract text via API route
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })
        
        const data = await response.json()
        
        if (response.ok && data.text && data.text.length > 50) {
          setContent(data.text)
        } else if (response.status === 422) {
          // Partial extraction or image-based PDF
          setContent(data.partial || "")
          alert("This PDF appears to be image-based or encrypted. Please copy and paste the text manually, or try a different file.")
        } else {
          setContent("")
          alert("Could not extract text from this PDF. Please copy and paste the text manually.")
        }
      } catch (err) {
        console.error("PDF extraction error:", err)
        setContent("")
        alert("Failed to process PDF. Please try copying and pasting the text manually.")
      }
    } else if (fileExt === 'txt' || fileExt === 'md') {
      // For text files, read directly
      const text = await file.text()
      setContent(text)
    } else if (fileExt === 'doc' || fileExt === 'docx') {
      // Word docs are not supported in browser
      setContent("")
      alert("Word documents (.doc/.docx) are not supported. Please save as PDF or copy and paste the text manually.")
    } else {
      const text = await file.text()
      setContent(text)
    }
    
    setActiveTab("paste")
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 1,
  })

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return
    await onGenerate(title, content, {
      flashcardCount,
      quizCount,
      examCount,
      examType,
    })
  }

  const clearFile = () => {
    setFileName(null)
    setContent("")
    setTitle("")
  }

  const generationSteps = [
    { icon: Layers, label: "Flashcards" },
    { icon: FileText, label: "Summary" },
    { icon: BookCheck, label: "Quiz" },
    { icon: GraduationCap, label: "Mock Exam" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Upload Your Document</h2>
          <p className="text-sm text-muted-foreground">
            Upload or paste your study material to generate learning content
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="paste">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-secondary/50"
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ scale: isDragActive ? 1.05 : 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium mb-1">
                  {isDragActive ? "Drop your file here" : "Drag & drop your file"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse (PDF, TXT, MD)
                </p>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {fileName && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl"
              >
                <FileText className="w-5 h-5 text-primary" />
                <span className="flex-1 text-sm font-medium truncate">{fileName}</span>
                <button
                  onClick={clearFile}
                  className="p-1 hover:bg-secondary rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="paste" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder="e.g., Chapter 5: Cell Biology"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Study Content</Label>
            <Textarea
              id="content"
              placeholder="Paste your study notes, textbook content, or any material you want to learn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] rounded-xl resize-none"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Customization Options */}
      <div className="mt-6 border border-border/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-sm font-medium">Customize Generation Options</span>
          <motion.div
            animate={{ rotate: showOptions ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
        
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4 bg-card">
                {/* Flashcards */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Number of Flashcards: {flashcardCount}
                  </Label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={flashcardCount}
                    onChange={(e) => setFlashcardCount(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Quiz Questions */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-primary" />
                    Number of Quiz Questions: {quizCount}
                  </Label>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="1"
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5</span>
                    <span>15</span>
                  </div>
                </div>

                {/* Mock Exam Questions */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Number of Exam Questions: {examCount}
                  </Label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={examCount}
                    onChange={(e) => setExamCount(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Exam Type */}
                <div className="space-y-2">
                  <Label>Exam Question Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setExamType("mcq")}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        examType === "mcq"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-secondary/80 border-border"
                      }`}
                    >
                      MCQ Only
                    </button>
                    <button
                      onClick={() => setExamType("essay")}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        examType === "essay"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-secondary/80 border-border"
                      }`}
                    >
                      Essay Only
                    </button>
                    <button
                      onClick={() => setExamType("mixed")}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        examType === "mixed"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-secondary/80 border-border"
                      }`}
                    >
                      Mixed
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!title.trim() || !content.trim() || isGenerating}
        className="w-full mt-6 h-12 rounded-xl text-base"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Study Materials...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate All Study Materials
          </>
        )}
      </Button>

      {/* Loading Animation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="space-y-3">
              {generationSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.5 }}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
                  >
                    <Loader2 className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-sm">Generating {step.label}...</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
