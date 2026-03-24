import { format, parseISO, subDays, startOfWeek, endOfWeek, isThisWeek } from 'date-fns'
import * as XLSX from 'xlsx'

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

export function toExcel(logs, name = 'ojt', profile = {}) {
  const wb = XLSX.utils.book_new()

  // Header info rows
  const headerRows = [
    ['OJT Time Logs Report'],
    [],
    ['Student Name:', profile?.full_name || name, '', 'Company:', profile?.company_name || ''],
    ['School:', profile?.school || '', '', 'Department:', profile?.department || ''],
    ['Supervisor:', profile?.supervisor_name || '', '', 'Date Generated:', format(new Date(), 'MMM d, yyyy')],
    [],
  ]

  // Column headers
  const colHeaders = ['No.', 'Date', 'Day', 'Time In', 'Time Out', 'Break (min)', 'Hours Worked', 'Description', 'Tasks', 'Mood']

  // Data rows
  const dataRows = logs.map((l, i) => {
    let dayName = ''
    try { dayName = format(parseISO(l.date), 'EEEE') } catch { dayName = '' }
    let dateStr = ''
    try { dateStr = format(parseISO(l.date), 'MMM d, yyyy') } catch { dateStr = l.date || '' }
    return [
      i + 1,
      dateStr,
      dayName,
      l.time_in || '',
      l.time_out || '',
      l.break_minutes || 0,
      Number(l.hours_worked || 0),
      l.description || '',
      (l.tasks || []).join(', '),
      moodL(l.mood || 3),
    ]
  })

  // Summary rows
  const totalHours = logs.reduce((s, l) => s + Number(l.hours_worked || 0), 0)
  const avgHours = logs.length ? totalHours / logs.length : 0
  const summaryRows = [
    [],
    ['', '', '', '', '', 'Total Hours:', totalHours, '', '', ''],
    ['', '', '', '', '', 'Average/Day:', Math.round(avgHours * 100) / 100, '', '', ''],
    ['', '', '', '', '', 'Total Entries:', logs.length, '', '', ''],
  ]

  // Combine all rows
  const allRows = [...headerRows, colHeaders, ...dataRows, ...summaryRows]
  const ws = XLSX.utils.aoa_to_sheet(allRows)

  // Column widths
  ws['!cols'] = [
    { wch: 5 },   // No.
    { wch: 14 },  // Date
    { wch: 11 },  // Day
    { wch: 9 },   // Time In
    { wch: 9 },   // Time Out
    { wch: 11 },  // Break
    { wch: 13 },  // Hours Worked
    { wch: 35 },  // Description
    { wch: 25 },  // Tasks
    { wch: 8 },   // Mood
  ]

  // Merge title row
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'OJT Time Logs')
  XLSX.writeFile(wb, `${name}-logs-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}
