"use client"

// Gamification Core System for Studynergy

export interface GamificationState {
  xp: number
  level: number
  streak: number
  lastPlayedDate: string | null
  achievements: string[]
  gamesPlayed: number
  correctAnswers: number
  totalAnswers: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: (state: GamificationState) => boolean
  xpReward: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_game",
    name: "First Steps",
    description: "Play your first game",
    icon: "Gamepad2",
    requirement: (state) => state.gamesPlayed >= 1,
    xpReward: 50,
  },
  {
    id: "perfect_run",
    name: "Perfect Run",
    description: "Get 100% accuracy in a game",
    icon: "Target",
    requirement: (state) => state.achievements.includes("perfect_run_earned"),
    xpReward: 100,
  },
  {
    id: "century",
    name: "Century",
    description: "Answer 100 questions correctly",
    icon: "Award",
    requirement: (state) => state.correctAnswers >= 100,
    xpReward: 200,
  },
  {
    id: "streak_5",
    name: "On Fire",
    description: "Maintain a 5-day streak",
    icon: "Flame",
    requirement: (state) => state.streak >= 5,
    xpReward: 150,
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Play 10 games",
    icon: "GraduationCap",
    requirement: (state) => state.gamesPlayed >= 10,
    xpReward: 250,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Answer 50 questions correctly",
    icon: "Zap",
    requirement: (state) => state.correctAnswers >= 50,
    xpReward: 100,
  },
]

const STORAGE_KEY = "studynergy_gamification"

const DEFAULT_STATE: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastPlayedDate: null,
  achievements: [],
  gamesPlayed: 0,
  correctAnswers: 0,
  totalAnswers: 0,
}

// Calculate XP needed for next level (exponential curve)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Get current progress percentage to next level
export function getLevelProgress(state: GamificationState): number {
  const currentLevelXP = getXPForLevel(state.level)
  const prevLevelXP = state.level > 1 ? getXPForLevel(state.level - 1) : 0
  const xpInCurrentLevel = state.xp - prevLevelXP
  const xpNeeded = currentLevelXP - prevLevelXP
  return Math.min((xpInCurrentLevel / xpNeeded) * 100, 100)
}

// Load state from localStorage
export function loadGamificationState(): GamificationState {
  if (typeof window === "undefined") return DEFAULT_STATE
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_STATE, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error("Failed to load gamification state:", e)
  }
  return DEFAULT_STATE
}

// Save state to localStorage
export function saveGamificationState(state: GamificationState): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save gamification state:", e)
  }
}

// Add XP and check for level up
export function addXP(state: GamificationState, amount: number): GamificationState {
  const newState = { ...state, xp: state.xp + amount }
  
  // Check for level up
  while (newState.xp >= getXPForLevel(newState.level)) {
    newState.level += 1
  }
  
  saveGamificationState(newState)
  return newState
}

// Record a correct answer
export function recordCorrectAnswer(state: GamificationState): GamificationState {
  const newState = {
    ...state,
    correctAnswers: state.correctAnswers + 1,
    totalAnswers: state.totalAnswers + 1,
  }
  saveGamificationState(newState)
  return newState
}

// Record a wrong answer
export function recordWrongAnswer(state: GamificationState): GamificationState {
  const newState = {
    ...state,
    totalAnswers: state.totalAnswers + 1,
  }
  saveGamificationState(newState)
  return newState
}

// Record a game session
export function recordGameSession(
  state: GamificationState,
  correct: number,
  total: number
): GamificationState {
  const today = new Date().toDateString()
  const lastPlayed = state.lastPlayedDate
  
  let newStreak = state.streak
  
  if (lastPlayed) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (lastPlayed === yesterday.toDateString()) {
      newStreak += 1
    } else if (lastPlayed !== today) {
      newStreak = 1
    }
  } else {
    newStreak = 1
  }
  
  let newState: GamificationState = {
    ...state,
    gamesPlayed: state.gamesPlayed + 1,
    correctAnswers: state.correctAnswers + correct,
    totalAnswers: state.totalAnswers + total,
    streak: newStreak,
    lastPlayedDate: today,
  }
  
  // Add XP based on performance
  const xpGained = correct * 10 + (correct === total ? 50 : 0)
  newState = addXP(newState, xpGained)
  
  // Mark perfect run if applicable
  if (correct === total && total > 0 && !newState.achievements.includes("perfect_run_earned")) {
    newState.achievements = [...newState.achievements, "perfect_run_earned"]
  }
  
  // Check for new achievements
  for (const achievement of ACHIEVEMENTS) {
    if (!newState.achievements.includes(achievement.id) && achievement.requirement(newState)) {
      newState.achievements = [...newState.achievements, achievement.id]
      newState = addXP(newState, achievement.xpReward)
    }
  }
  
  saveGamificationState(newState)
  return newState
}

// Reset state (for testing)
export function resetGamificationState(): GamificationState {
  saveGamificationState(DEFAULT_STATE)
  return DEFAULT_STATE
}
