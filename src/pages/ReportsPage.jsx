import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import { Download, Calendar, TrendingUp, Clock, Filter } from 'lucide-react'
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isWithinInterval } from 'date-fns'
import { fmtH, moodColor, moodL, toCSV, calcHours } from '../utils/helpers'

const PERIODS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'all', label: 'All Time' },
]

export default function ReportsPage({ logs, tasks, profile }) {
  const [period, setPeriod] = useState('30d')

  const filtered = useMemo(() => {
    if (period === 'all') return logs
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const cutoff = subDays(new Date(), days)
    return logs.filter(l => parseISO(l.date) >= cutoff)
  }, [logs, period])

  const totalH = filtered.reduce((s, l) => s + Number(l.hours_worked || 0), 0)
  const avgH = filtered.length ? totalH / filtered.length : 0
  const avgMood = filtered.length ? (filtered.reduce((s, l) => s + (l.mood || 3), 0) / filtered.length).toFixed(1) : '—'

  // Daily hours chart
  const dailyData = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const log = filtered.find(l => l.date === d)
      data.push({ date: format(subDays(new Date(), i), days > 30 ? 'MMM d' : 'EEE'), hours: log ? Number(log.hours_worked || 0) : 0 })
    }
    return days > 60 ? data.filter((_, i) => i % 3 === 0) : data
  }, [filtered, period])

  // Task status pie
  const taskPie = useMemo(() => [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, fill: 'var(--primary)' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, fill: 'var(--warning)' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, fill: 'var(--success)' },
  ].filter(t => t.value > 0), [tasks])

  // Mood distribution
  const moodDist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    filtered.forEach(l => { const m = (l.mood || 3) - 1; if (m >= 0 && m < 5) counts[m]++ })
    return counts.map((c, i) => ({ mood: i + 1, count: c, label: moodL(i + 1) }))
  }, [filtered])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Analytics and insights for your internship</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => {
            const blob = new Blob([toCSV(filtered, profile?.full_name || 'User')], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `ojt-report-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Period filter */}
      <div className="seg-ctrl" style={{ maxWidth: 420 }}>
        {PERIODS.map(p => (
          <button key={p.id} className={`seg-btn ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Total Hours</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-.03em' }}>{fmtH(totalH)}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{filtered.length} log entries</div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Daily Average</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)', letterSpacing: '-.03em' }}>{fmtH(avgH)}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>per entry</div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Avg Mood</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--warning)', letterSpacing: '-.03em' }}>{avgMood}/5</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{filtered.length ? moodL(Math.round(avgMood)) : 'N/A'}</div>
        </div>
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Tasks Done</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)', letterSpacing: '-.03em' }}>{tasks.filter(t => t.status === 'done').length}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>of {tasks.length} total</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, letterSpacing: '-.01em' }}>Hours Over Time</div>
          {dailyData.some(d => d.hours > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007aff" stopOpacity={.12} />
                    <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, boxShadow: 'var(--sh)' }} />
                <Area type="monotone" dataKey="hours" stroke="#007aff" strokeWidth={2} fill="url(#rg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)', fontSize: 13 }}>No data in this period</div>}
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, letterSpacing: '-.01em' }}>Mood Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moodDist} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {moodDist.map((d, i) => <Cell key={i} fill={moodColor(d.mood)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task breakdown */}
      {taskPie.length > 0 && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, letterSpacing: '-.01em' }}>Task Breakdown</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={taskPie} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {taskPie.map((t, i) => <Cell key={i} fill={t.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {taskPie.map(t => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: t.fill, display: 'inline-block' }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}: <b>{t.value}</b></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
