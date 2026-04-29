// Game Data Adapter for Studynergy
// Transforms quiz data into game-compatible format

export interface GameQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer?: string
  correctAnswer?: number
}

// Convert quiz data to game questions format
export function convertQuizToGameQuestions(
  quizData: QuizQuestion[]
): GameQuestion[] {
  return quizData
    .filter((q) => q.question && q.options && q.options.length >= 2)
    .map((q, index) => {
      // Determine correct index
      let correctIndex = 0
      
      if (typeof q.correctAnswer === "number") {
        correctIndex = q.correctAnswer
      } else if (typeof q.correct_answer === "string") {
        const idx = q.options.findIndex(
          (opt) => opt.toLowerCase() === q.correct_answer?.toLowerCase()
        )
        correctIndex = idx >= 0 ? idx : 0
      }
      
      // Ensure we have exactly 4 options (pad or trim)
      let options = [...q.options]
      while (options.length < 4) {
        options.push(`Option ${options.length + 1}`)
      }
      options = options.slice(0, 4)
      
      // Make sure correctIndex is valid
      correctIndex = Math.min(Math.max(0, correctIndex), 3)
      
      return {
        id: `q_${index}`,
        question: q.question,
        options,
        correctIndex,
      }
    })
}

// Get random subset of questions
export function getRandomQuestions(
  questions: GameQuestion[],
  count: number = 10
): GameQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Mock questions for demo/testing when no quiz data available
export function getMockQuestions(): GameQuestion[] {
  return [
    {
      id: "mock_1",
      question: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Body"],
      correctIndex: 1,
    },
    {
      id: "mock_2",
      question: "What is the chemical symbol for water?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      correctIndex: 0,
    },
    {
      id: "mock_3",
      question: "Who wrote Romeo and Juliet?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctIndex: 1,
    },
    {
      id: "mock_4",
      question: "What is the largest planet in our solar system?",
      options: ["Mars", "Saturn", "Jupiter", "Neptune"],
      correctIndex: 2,
    },
    {
      id: "mock_5",
      question: "What year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctIndex: 2,
    },
    {
      id: "mock_6",
      question: "What is the speed of light?",
      options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "200,000 km/s"],
      correctIndex: 0,
    },
    {
      id: "mock_7",
      question: "Which element has the atomic number 6?",
      options: ["Oxygen", "Nitrogen", "Carbon", "Hydrogen"],
      correctIndex: 2,
    },
    {
      id: "mock_8",
      question: "What is the capital of Japan?",
      options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
      correctIndex: 2,
    },
    {
      id: "mock_9",
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Arctic", "Pacific"],
      correctIndex: 3,
    },
    {
      id: "mock_10",
      question: "Who painted the Mona Lisa?",
      options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
      correctIndex: 1,
    },
  ]
}
