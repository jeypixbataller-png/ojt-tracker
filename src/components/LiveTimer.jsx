import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Square, Clock } from 'lucide-react'

export default function LiveTimer({ onTimerComplete }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [startedAt, setStartedAt] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Restore from localStorage
    const saved = localStorage.getItem('ojt-timer')
    if (saved) {
      try {
        const { start, accumulated } = JSON.parse(saved)
        if (start) {
          setStartedAt(start)
          setElapsed(accumulated + Math.floor((Date.now() - start) / 1000))
          setRunning(true)
        } else {
          setElapsed(accumulated || 0)
        }
      } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (running && startedAt) {
      intervalRef.current = setInterval(() => {
        const saved = localStorage.getItem('ojt-timer')
        const accumulated = saved ? JSON.parse(saved).accumulated || 0 : 0
        setElapsed(accumulated + Math.floor((Date.now() - startedAt) / 1000))
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, startedAt])

  const start = useCallback(() => {
    const now = Date.now()
    setStartedAt(now)
    setRunning(true)
    localStorage.setItem('ojt-timer', JSON.stringify({ start: now, accumulated: elapsed }))
  }, [elapsed])

  const pause = useCallback(() => {
    setRunning(false)
    setStartedAt(null)
    localStorage.setItem('ojt-timer', JSON.stringify({ start: null, accumulated: elapsed }))
  }, [elapsed])

  const stop = useCallback(() => {
    const hours = elapsed / 3600
    setRunning(false)
    setElapsed(0)
    setStartedAt(null)
    localStorage.removeItem('ojt-timer')
    if (hours > 0 && onTimerComplete) onTimerComplete(hours)
  }, [elapsed, onTimerComplete])

  const fmt = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className="card" style={{ padding: '20px 22px', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
        <Clock size={16} style={{ color: running ? 'var(--success)' : 'var(--text3)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Live Timer</span>
        {running && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }} />}
      </div>
      <div style={{
        fontSize: 'clamp(28px,5vw,40px)', fontWeight: 700, letterSpacing: '-.03em',
        fontFamily: 'monospace', color: running ? 'var(--primary)' : 'var(--text)',
        marginBottom: 18, transition: 'color .3s'
      }}>
        {fmt(elapsed)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {!running ? (
          <button className="btn btn-primary" onClick={start}>
            <Play size={14} /> {elapsed > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={pause}>
            <Pause size={14} /> Pause
          </button>
        )}
        {elapsed > 0 && (
          <button className="btn btn-danger" onClick={stop}>
            <Square size={14} /> Stop & Log
          </button>
        )}
      </div>
      {elapsed > 0 && !running && (
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>
          Stop to auto-create a log entry with {(elapsed / 3600).toFixed(2)}h
        </p>
      )}
    </div>
  )
}
