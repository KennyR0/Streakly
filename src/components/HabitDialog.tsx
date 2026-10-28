import { useEffect, useState, type FormEvent } from 'react'
import type { Habit } from '../types/habit'

type HabitDialogProps = {
  habit: Habit | null
  onClose: () => void
  onSave: (name: string) => void
}

export function HabitDialog({ habit, onClose, onSave }: HabitDialogProps) {
  const [name, setName] = useState(habit?.name ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    setName(habit?.name ?? '')
    setError('')
  }, [habit])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Escribe un nombre para tu hábito.')
      return
    }
    onSave(trimmed)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="habit-dialog" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-topline">
          <span className="dialog-mark"><span /></span>
          <button className="icon-button dialog-close" type="button" onClick={onClose} aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <h2 id="dialog-title">{habit ? 'Edita tu hábito' : 'Crea un nuevo hábito'}</h2>
        <p className="dialog-copy">Los pequeños pasos de hoy construyen lo que serás mañana.</p>
        <label className="field-label" htmlFor="habit-name">Nombre del hábito</label>
        <input
          id="habit-name"
          autoFocus
          maxLength={60}
          value={name}
          onChange={(event) => { setName(event.target.value); setError('') }}
          placeholder="Ej. Leer 10 páginas"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'habit-error' : undefined}
        />
        {error && <p className="field-error" id="habit-error">{error}</p>}
        <div className="dialog-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>Cancelar</button>
          <button className="button button-primary" type="submit">{habit ? 'Guardar cambios' : 'Crear hábito'}</button>
        </div>
      </form>
    </div>
  )
}
