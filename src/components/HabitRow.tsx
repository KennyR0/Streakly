import { currentStreak, toDateKey } from '../lib/dates'
import type { Habit } from '../types/habit'

type HabitRowProps = {
  habit: Habit
  week: Date[]
  today: Date
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export function HabitRow({ habit, week, today, onToggle, onEdit, onDelete }: HabitRowProps) {
  const doneToday = habit.completedDates.includes(toDateKey(today))
  const streak = currentStreak(habit.completedDates, today)

  return (
    <article className={`habit-row${doneToday ? ' is-complete' : ''}`}>
      <button
        className="completion-button"
        type="button"
        onClick={onToggle}
        aria-label={doneToday ? `Marcar ${habit.name} como pendiente` : `Completar ${habit.name}`}
        aria-pressed={doneToday}
      >
        {doneToday && <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 10 3.2 3.2L15.5 6" /></svg>}
      </button>
      <div className="habit-copy">
        <p className="habit-name">{habit.name}</p>
        <p className="habit-streak">
          <span className="flame" aria-hidden="true">✳</span>
          {streak > 0 ? `${streak} ${streak === 1 ? 'día' : 'días'} seguidos` : 'Empieza hoy'}
        </p>
      </div>
      <div className="week-dots" aria-label="Progreso de esta semana">
        {week.map((date) => {
          const dateKey = toDateKey(date)
          const completed = habit.completedDates.includes(dateKey)
          const isToday = dateKey === toDateKey(today)
          return <span key={dateKey} className={`week-dot${completed ? ' done' : ''}${isToday ? ' today' : ''}`} aria-label={`${date.toLocaleDateString('es', { weekday: 'long' })}${completed ? ', completado' : ''}`} />
        })}
      </div>
      <div className="habit-actions">
        <button className="icon-button" type="button" onClick={onEdit} aria-label={`Editar ${habit.name}`}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.8 4.2 3 3M4 16l3.5-.7L16 6.8a1.7 1.7 0 0 0-2.4-2.4l-8.5 8.5L4 16Z" /></svg>
        </button>
        <button className="icon-button delete-button" type="button" onClick={onDelete} aria-label={`Eliminar ${habit.name}`}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 6h11M8 6V4.5h4V6m-6 0 .7 9h6.6l.7-9M8.5 9v3.5m3-3.5v3.5" /></svg>
        </button>
      </div>
    </article>
  )
}
