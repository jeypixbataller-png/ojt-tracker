import { useMemo } from 'react'
import { format, subDays, parseISO } from 'date-fns'

export default function Heatmap({ logs }) {
  const data = useMemo(() => {
    const map = {}
    logs.forEach(l => { map[l.date] = (map[l.date] || 0) + Number(l.hours_worked || 0) })
    const days = []
    for (let i = 364; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      days.push({ date: d, hours: map[d] || 0 })
    }
    return days
  }, [logs])

  const maxH = Math.max(...data.map(d => d.hours), 1)

  function getColor(h) {
    if (h === 0) return 'var(--bg2)'
    const intensity = Math.min(h / maxH, 1)
    if (intensity < 0.25) return 'rgba(0,122,255,.15)'
    if (intensity < 0.5) return 'rgba(0,122,255,.35)'
    if (intensity < 0.75) return 'rgba(0,122,255,.55)'
    return 'rgba(0,122,255,.8)'
  }

  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <div className="card" style={{ padding: '18px 20px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-.01em' }}>Activity Heatmap</span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Last 52 weeks</span>
      </div>
      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map((day, di) => (
              <div key={di} title={`${day.date}: ${day.hours.toFixed(1)}h`}
                style={{
                  width: 11, height: 11, borderRadius: 2,
                  background: getColor(day.hours),
                  transition: 'transform .1s',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
        <span>Less</span>
        {[0, 0.15, 0.35, 0.55, 0.8].map((o, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: i === 0 ? 'var(--bg2)' : `rgba(0,122,255,${o})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
