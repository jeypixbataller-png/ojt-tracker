import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { fmtH, moodColor } from '../utils/helpers'

export default function CalendarView({ logs, setPage }) {
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(null)

  const logMap = useMemo(() => {
    const m = {}
    logs.forEach(l => { m[l.date] = l })
    return m
  }, [logs])

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(current)
    const monthEnd = endOfMonth(current)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    const rows = []
    let day = calStart
    while (day <= calEnd) {
      const week = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(day))
        day = addDays(day, 1)
      }
      rows.push(week)
    }
    return rows
  }, [current])

  const selectedLog = selected ? logMap[format(selected, 'yyyy-MM-dd')] : null

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-sub">View your OJT activity at a glance</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setPage('logs')}>
          <Clock size={14} /> Log View
        </button>
      </div>

      <div className="card" style={{ padding: '20px 22px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setCurrent(subMonths(current, 1))}><ChevronLeft size={18} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>{format(current, 'MMMM yyyy')}</h2>
          <button className="btn btn-ghost btn-icon" onClick={() => setCurrent(addMonths(current, 1))}><ChevronRight size={18} /></button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text3)', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '.06em' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {week.map((day, di) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const log = logMap[dateStr]
              const inMonth = isSameMonth(day, current)
              const isToday = isSameDay(day, new Date())
              const isSel = selected && isSameDay(day, selected)
              return (
                <button key={di} onClick={() => setSelected(day)}
                  style={{
                    padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isSel ? 'var(--primary)' : isToday ? 'var(--primary-bg)' : 'transparent',
                    transition: 'all .15s', textAlign: 'center', position: 'relative',
                    opacity: inMonth ? 1 : 0.3,
                  }}>
                  <div style={{ fontSize: 13, fontWeight: isToday || isSel ? 700 : 500, color: isSel ? '#fff' : isToday ? 'var(--primary)' : 'var(--text)', lineHeight: 1.5 }}>
                    {format(day, 'd')}
                  </div>
                  {log && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: moodColor(log.mood || 3), display: 'inline-block' }} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="card" style={{ padding: '18px 22px', animation: 'fadeUp .2s ease' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, letterSpacing: '-.02em' }}>
            {format(selected, 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div><span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Hours</span><div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>{fmtH(selectedLog.hours_worked)}</div></div>
                <div><span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Time</span><div style={{ fontWeight: 600, fontSize: 14 }}>{selectedLog.time_in || '—'} – {selectedLog.time_out || '—'}</div></div>
                <div><span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Mood</span><div style={{ width: 12, height: 12, borderRadius: '50%', background: moodColor(selectedLog.mood || 3), marginTop: 4 }} /></div>
              </div>
              {selectedLog.description && <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>{selectedLog.description}</p>}
            </div>
          ) : (
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>No log entry for this day.
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 10 }} onClick={() => setPage('logs')}>Log Entry</button>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
