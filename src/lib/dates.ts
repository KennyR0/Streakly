const dateFormatter = new Intl.DateTimeFormat('es', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  next.setDate(next.getDate() + amount)
  return next
}

export function formatToday(date: Date): string {
  const formatted = dateFormatter.format(date)
  return formatted.charAt(0).toLocaleUpperCase('es') + formatted.slice(1)
}

export function currentWeek(date: Date): Date[] {
  const mondayOffset = (date.getDay() + 6) % 7
  const monday = addDays(date, -mondayOffset)
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
}

export function currentStreak(completedDates: string[], today: Date): number {
  const completions = new Set(completedDates)
  const todayKey = toDateKey(today)
  const start = completions.has(todayKey) ? today : addDays(today, -1)
  let streak = 0

  for (let cursor = start; completions.has(toDateKey(cursor)); cursor = addDays(cursor, -1)) {
    streak += 1
  }

  return streak
}
