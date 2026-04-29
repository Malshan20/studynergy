export interface SaveGameResult {
  success: boolean
  xpEarned: number
  totalXp: number
  level: number
  streak: number
  newAchievements: string[]
}

export async function saveGameResult(params: {
  gameMode: string
  documentId?: string | null
  score: number
  correct: number
  total: number
  durationSeconds?: number | null
}): Promise<SaveGameResult | null> {
  try {
    const res = await fetch("/api/game/save-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameMode: params.gameMode,
        documentId: params.documentId || null,
        score: params.score,
        correct: params.correct,
        total: params.total,
        durationSeconds: params.durationSeconds || null,
      }),
    })
    if (res.ok) {
      return await res.json()
    }
    return null
  } catch {
    return null
  }
}
