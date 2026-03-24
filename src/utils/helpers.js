import { format, parseISO, subDays, startOfWeek, endOfWeek, isThisWeek } from 'date-fns'

export const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export function fmtH(h) {
  const n = Math.max(0, Number(h) || 0)
  const hrs = Math.floor(n)
  const mins = Math.round((n - hrs) * 60)
  if (!hrs && !mins) return '0h'
  if (!mins) return `${hrs}h`
  if (!hrs) return `${mins}m`
  return `${hrs}h ${mins}m`
}

export function fmtDate(d) {
  try { return format(parseISO(d), 'MMM d, yyyy') } catch { return d || '—' }
}

export function fmtDateShort(d) {
  try { return format(parseISO(d), 'MMM d') } catch { return d || '—' }
}

export function calcHours(tIn, tOut, brk = 0) {
  try {
    if (!tIn || !tOut) return 0
    const [ih, im] = tIn.split(':').map(Number)
    const [oh, om] = tOut.split(':').map(Number)
    const mins = (oh * 60 + om) - (ih * 60 + im) - Number(brk || 0)
    return Math.max(0, Math.round(mins / 60 * 100) / 100)
  } catch { return 0 }
}

// Mood helpers — 1-5 scale
export const MOOD_COLORS = ['', '#ff3b30', '#ff9500', '#007aff', '#34c759', '#30d158']
export const MOOD_LABELS = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Great']
export const moodL = m => MOOD_LABELS[m] || 'Okay'
export const moodColor = m => MOOD_COLORS[m] || '#007aff'

export function weeklyData(logs, n = 8) {
  return Array.from({ length: n }, (_, i) => {
    const ref = subDays(new Date(), (n - 1 - i) * 7)
    const s = startOfWeek(ref, { weekStartsOn: 1 })
    const e = endOfWeek(ref, { weekStartsOn: 1 })
    const wl = logs.filter(l => {
      try { const d = parseISO(l.date); return d >= s && d <= e } catch { return false }
    })
    return {
      week: format(s, 'MMM d'),
      hours: Math.round(wl.reduce((a, l) => a + Number(l.hours_worked || 0), 0) * 10) / 10,
    }
  })
}

export function calcStreak(logs) {
  if (!logs.length) return 0
  const dates = [...new Set(logs.map(l => l.date))].sort().reverse()
  let s = 0, cur = new Date()
  for (const d of dates) {
    if (Math.round((cur - parseISO(d)) / 86400000) <= 1) { s++; cur = parseISO(d) }
    else break
  }
  return s
}

export function calcWeekHours(logs) {
  return logs
    .filter(l => { try { return isThisWeek(parseISO(l.date), { weekStartsOn: 1 }) } catch { return false } })
    .reduce((a, l) => a + Number(l.hours_worked || 0), 0)
}

export function toCSV(logs, name = 'ojt') {
  const rows = [
    ['Date', 'Time In', 'Time Out', 'Break (min)', 'Hours', 'Description', 'Tasks', 'Mood'],
    ...logs.map(l => [
      l.date, l.time_in || '', l.time_out || '',
      l.break_minutes || 0,
      Number(l.hours_worked || 0).toFixed(2),
      `"${(l.description || '').replace(/"/g, '""')}"`,
      `"${(l.tasks || []).join(', ')}"`,
      l.mood || 3,
    ]),
  ]
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
  Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${name}-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`,
  }).click()
}
