import type { Habit, HabitStore } from '../types/habit'

export const STORAGE_KEY = 'streakly.habits.v1'
export const RECOVERY_KEY = 'streakly.habits.recovery'

export type LoadResult =
  | { status: 'loaded'; habits: Habit[] }
  | { status: 'recovery'; habits: []; message: string }

function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function isHabit(value: unknown): value is Habit {
  if (!value || typeof value !== 'object') return false
  const habit = value as Record<string, unknown>
  return (
    typeof habit.id === 'string' &&
    habit.id.length > 0 &&
    typeof habit.name === 'string' &&
    habit.name.trim().length > 0 &&
    typeof habit.createdAt === 'string' &&
    Number.isFinite(Date.parse(habit.createdAt)) &&
    Array.isArray(habit.completedDates) &&
    habit.completedDates.every(isDateKey)
  )
}

function isHabitStore(value: unknown): value is HabitStore {
  if (!value || typeof value !== 'object') return false
  const store = value as Record<string, unknown>
  return store.version === 1 && Array.isArray(store.habits) && store.habits.every(isHabit)
}

export function loadHabits(): LoadResult {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return { status: 'recovery', habits: [], message: 'El almacenamiento local no está disponible en este navegador.' }
  }

  if (raw === null) return { status: 'loaded', habits: [] }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isHabitStore(parsed)) throw new Error('Formato no compatible')
    return { status: 'loaded', habits: parsed.habits }
  } catch {
    try {
      if (window.localStorage.getItem(RECOVERY_KEY) === null) {
        window.localStorage.setItem(RECOVERY_KEY, raw)
      }
    } catch {
      return { status: 'recovery', habits: [], message: 'No pudimos leer los hábitos guardados. El navegador no permite crear una copia de seguridad.' }
    }
    return { status: 'recovery', habits: [], message: 'Encontramos datos guardados que no se pueden leer. Conservamos una copia antes de continuar.' }
  }
}

export function saveHabits(habits: Habit[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, habits } satisfies HabitStore))
    return true
  } catch {
    return false
  }
}
