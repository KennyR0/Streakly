import { useEffect, useState, type CSSProperties } from 'react'
import { HabitDialog } from './components/HabitDialog'
import { HabitRow } from './components/HabitRow'
import { currentWeek, formatToday, toDateKey } from './lib/dates'
import { loadHabits, saveHabits, type LoadResult } from './lib/storage'
import type { Habit } from './types/habit'

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function App() {
  const [today, setToday] = useState(() => new Date())
  const [habits, setHabits] = useState<Habit[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'recovery'>('loading')
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [storageMessage, setStorageMessage] = useState('')
  const [dialogHabit, setDialogHabit] = useState<Habit | null | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const result: LoadResult = loadHabits()
    setHabits(result.habits)
    if (result.status === 'recovery') {
      setRecoveryMessage(result.message)
      setStatus('recovery')
    } else {
      setStatus('ready')
    }
  }, [])

  useEffect(() => {
    if (status !== 'ready') return
    if (!saveHabits(habits)) {
      setStorageMessage('No se pudieron guardar los cambios. Comprueba el espacio disponible en tu navegador.')
      return
    }
    setStorageMessage('')
  }, [habits, status])

  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const dateKey = toDateKey(today)
  const week = currentWeek(today)
  const completedCount = habits.filter((habit) => habit.completedDates.includes(dateKey)).length
  const progress = habits.length === 0 ? 0 : Math.round((completedCount / habits.length) * 100)
  const completedDays = week.map((date) => habits.reduce((count, habit) => count + Number(habit.completedDates.includes(toDateKey(date))), 0))

  function saveHabit(name: string) {
    if (dialogHabit) {
      setHabits((current) => current.map((habit) => habit.id === dialogHabit.id ? { ...habit, name } : habit))
      setNotice('Hábito actualizado')
    } else {
      setHabits((current) => [...current, { id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), completedDates: [] }])
      setNotice('Hábito creado')
    }
    setDialogHabit(undefined)
    window.setTimeout(() => setNotice(''), 2400)
  }

  function toggleHabit(habit: Habit) {
    setHabits((current) => current.map((item) => {
      if (item.id !== habit.id) return item
      const completedDates = new Set(item.completedDates)
      if (completedDates.has(dateKey)) completedDates.delete(dateKey)
      else completedDates.add(dateKey)
      return { ...item, completedDates: [...completedDates].sort() }
    }))
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setHabits((current) => current.filter((habit) => habit.id !== deleteTarget.id))
    setDeleteTarget(null)
    setNotice('Hábito eliminado')
    window.setTimeout(() => setNotice(''), 2400)
  }

  if (status === 'loading') {
    return <main className="loading-screen" aria-label="Cargando Streakly"><div className="loading-mark" /><span>Preparando tu espacio</span></main>
  }

  if (status === 'recovery') {
    return (
      <main className="recovery-screen">
        <div className="recovery-card">
          <div className="empty-symbol recovery-symbol"><span /></div>
          <h1>Vamos a empezar de nuevo</h1>
          <p>{recoveryMessage}</p>
          <button className="button button-primary" onClick={() => setStatus('ready')}>Continuar sin los datos anteriores</button>
        </div>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="Streakly, inicio">
          <span className="brand-symbol"><span /></span>
          <span>streakly</span>
        </a>
        <div className="sidebar-section-label">ESPACIO</div>
        <nav aria-label="Navegación principal">
          <a className="nav-item active" href="#inicio" aria-current="page">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 9.2 10 3l7 6.2v7.3a.8.8 0 0 1-.8.8h-4.4v-5H8.2v5H3.8a.8.8 0 0 1-.8-.8V9.2Z" /></svg>
            <span>Mis hábitos</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><span className="note-spark">✳</span><p>La constancia se construye un día a la vez.</p></div>
          <span className="local-note"><span /> Tus datos viven en este dispositivo</span>
        </div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar">
          <div className="breadcrumbs"><span>Mi espacio</span><span className="breadcrumb-divider">/</span><strong>Mis hábitos</strong></div>
          <div className="today-label"><span className="today-indicator" /> Hoy, {formatToday(today)}</div>
        </header>

        <div className="dashboard">
          <section className="welcome-row">
            <div>
              <p className="date-caption">{formatToday(today)}</p>
              <h1>Haz que cada día <span>cuente.</span></h1>
              <p className="welcome-subtitle">Un pequeño paso hoy. Una gran diferencia mañana.</p>
            </div>
            <button className="button button-primary add-button" onClick={() => setDialogHabit(null)}>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
              Nuevo hábito
            </button>
          </section>

          {storageMessage && <div className="storage-alert" role="status">{storageMessage}</div>}

          <section className="overview-grid" aria-label="Resumen de progreso">
            <div className="progress-panel">
              <div className="progress-ring" style={{ '--progress': `${progress}%` } as CSSProperties} role="img" aria-label={`${progress}% completado hoy`}>
                <div className="ring-center"><strong>{progress}<span>%</span></strong><small>HOY</small></div>
              </div>
              <div className="progress-details">
                <p className="panel-eyebrow">TU PROGRESO</p>
                <h2>{completedCount === habits.length && habits.length > 0 ? 'Todo en equilibrio' : 'Sigue a tu ritmo'}</h2>
                <p>{habits.length === 0 ? 'Tus hábitos aparecerán aquí.' : `${completedCount} de ${habits.length} ${habits.length === 1 ? 'hábito completado' : 'hábitos completados'}`}</p>
                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="panel-ornament" aria-hidden="true" />
            </div>

            <div className="week-panel">
              <div className="week-heading">
                <div><p className="panel-eyebrow">TU SEMANA</p><h2>Un día a la vez</h2></div>
                <span className="week-total">{completedDays.reduce((sum, value) => sum + value, 0)} <span>hechos</span></span>
              </div>
              <div className="week-chart" aria-label="Hábitos completados durante la semana">
                {week.map((day, index) => {
                  const isToday = toDateKey(day) === dateKey
                  const barHeight = completedDays[index] ? Math.max(18, Math.min(100, completedDays[index] * 28)) : 8
                  return (
                    <div className={`chart-day${isToday ? ' current' : ''}`} key={toDateKey(day)}>
                      <div className="chart-track"><span style={{ height: `${barHeight}%` }} /></div>
                      <span className="chart-label">{weekdays[index]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="habits-section" aria-labelledby="habits-title">
            <div className="section-heading">
              <div><h2 id="habits-title">Tus hábitos</h2><p>La intención se convierte en acción.</p></div>
              {habits.length > 0 && <span className="habit-count">{habits.length} {habits.length === 1 ? 'hábito' : 'hábitos'}</span>}
            </div>

            {habits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-art" aria-hidden="true"><div className="empty-orbit orbit-one" /><div className="empty-orbit orbit-two" /><div className="empty-symbol"><span /></div><div className="empty-dot dot-one" /><div className="empty-dot dot-two" /></div>
                <h3>Todo gran cambio empieza pequeño.</h3>
                <p>Crea tu primer hábito y empieza a construir una rutina que te haga bien.</p>
                <button className="button button-secondary empty-cta" onClick={() => setDialogHabit(null)}>
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
                  Añadir mi primer hábito
                </button>
              </div>
            ) : (
              <div className="habit-list">
                <div className="list-caption"><span>HÁBITO</span><span>ÚLTIMOS 7 DÍAS</span><span>ACCIONES</span></div>
                {habits.map((habit) => <HabitRow
                  key={habit.id}
                  habit={habit}
                  week={week}
                  today={today}
                  onToggle={() => toggleHabit(habit)}
                  onEdit={() => setDialogHabit(habit)}
                  onDelete={() => setDeleteTarget(habit)}
                />)}
                {completedCount === habits.length && habits.length > 0 && <div className="all-done"><span>✳</span> Lo hiciste por hoy. Celebra tu constancia.</div>}
              </div>
            )}
          </section>

          <footer className="dashboard-footer"><span>Una rutina a la vez.</span><span>STREAKLY <i>·</i> HECHO PARA DURAR</span></footer>
        </div>
      </main>

      {dialogHabit !== undefined && <HabitDialog habit={dialogHabit} onClose={() => setDialogHabit(undefined)} onSave={saveHabit} />}
      {deleteTarget && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDeleteTarget(null)}>
          <div className="habit-dialog delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="dialog-topline"><span className="delete-mark">!</span><button className="icon-button dialog-close" onClick={() => setDeleteTarget(null)} aria-label="Cerrar">×</button></div>
            <h2 id="delete-title">¿Eliminar este hábito?</h2>
            <p className="dialog-copy">Se eliminará “{deleteTarget.name}” y su historial. Esta acción no se puede deshacer.</p>
            <div className="dialog-actions"><button className="button button-secondary" onClick={() => setDeleteTarget(null)}>Conservar</button><button className="button button-danger" onClick={confirmDelete}>Eliminar hábito</button></div>
          </div>
        </div>
      )}
      {notice && <div className="toast" role="status">{notice}</div>}
      <span className="visually-hidden" aria-live="polite">{completedCount} de {habits.length} hábitos completados hoy</span>
    </div>
  )
}

export default App
