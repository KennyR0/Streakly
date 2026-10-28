export type Habit = {
  id: string
  name: string
  createdAt: string
  completedDates: string[]
}

export type HabitStore = {
  version: 1
  habits: Habit[]
}
