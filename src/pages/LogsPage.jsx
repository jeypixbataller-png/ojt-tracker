import { useState, useRef } from 'react'
import { Plus, Trash2, Edit3, Download, Search, X, Check, Clock, Upload } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fmtH, moodL, moodColor, toCSV, calcHours, todayStr } from '../utils/helpers'

export default function LogsPage({ logs, addLog, updateLog, deleteLog, profile, loading }) {
  const [showForm,  setShowForm]  = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [search,    setSearch]    = useState('')
  const [confirmId, setConfirm]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [form,      setForm]      = useState(blank())
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)

  function blank() {
    return { date: todayStr(), time_in: '08:00', time_out: '17:00', break_minutes: 60, description: '', mood: 3, tasks: '' }
  }
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const filtered = logs.filter(l =>
    !search || l.description?.toLowerCase().includes(search.toLowerCase()) || l.date.includes(search)
  )
  const total   = logs.reduce((s, l) => s + Number(l.hours_worked || 0), 0)
  const preview = calcHours(form.time_in, form.time_out, form.break_minutes)

  function openAdd() { setForm(blank()); setEditId(null); setError(''); setShowForm(true) }
  function openEdit(l) {
    setForm({ date: l.date, time_in: l.time_in || '', time_out: l.time_out || '', break_minutes: l.break_minutes || 0, description: l.description || '', mood: l.mood || 3, tasks: (l.tasks || []).join(', ') })
    setEditId(l.id); setError(''); setShowForm(true)
  }

  async function save() {
    if (!form.date) { setError('Date is required'); return }
    if (form.date > todayStr()) { setError('Cannot log hours for a future date'); return }
    setSaving(true); setError('')
    const { error } = editId ? await updateLog(editId, form) : await addLog(form)
    setSaving(false)
    if (error) { setError(error.message || 'Failed to save'); return }
    setShowForm(false); setEditId(null)
  }

  async function del(id) { await deleteLog(id); setConfirm(null) }

  async function handleCSVImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { setError('CSV file is empty'); setImporting(false); return }
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
      const dateIdx = headers.findIndex(h => h === 'date')
      const timeInIdx = headers.findIndex(h => h.includes('time_in') || h.includes('time in'))
      const timeOutIdx = headers.findIndex(h => h.includes('time_out') || h.includes('time out'))
      const breakIdx = headers.findIndex(h => h.includes('break'))
      const descIdx = headers.findIndex(h => h.includes('description') || h.includes('desc'))
      const moodIdx = headers.findIndex(h => h.includes('mood'))

      if (dateIdx === -1) { setError('CSV must have a "date" column'); setImporting(false); return }

      let imported = 0
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        if (!vals[dateIdx]) continue
        if (vals[dateIdx] > todayStr()) continue
        await addLog({
          date: vals[dateIdx],
          time_in: vals[timeInIdx] || '',
          time_out: vals[timeOutIdx] || '',
          break_minutes: vals[breakIdx] ? Number(vals[breakIdx]) : 0,
          description: vals[descIdx] || '',
          mood: vals[moodIdx] ? Number(vals[moodIdx]) : 3,
          tasks: ''
        })
        imported++
      }
      setError('')
      alert(`Successfully imported ${imported} log entries`)
    } catch (err) {
      setError('Failed to parse CSV file')
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Time Logs</h1>
          <p className="page-sub">Record and manage your daily OJT hours</p>
        </div>
        <div className="page-actions">
          <input type="file" ref={fileRef} accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={importing}>
            <Upload size={14} /> {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <button className="btn btn-ghost" onClick={() => toCSV(logs, profile?.full_name || 'ojt')}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Log Hours</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
        {[['Entries', logs.length], ['Total', fmtH(total)], ['Average', logs.length ? fmtH(total / logs.length) : '—'], ['Best Day', logs.length ? fmtH(Math.max(...logs.map(l => Number(l.hours_worked || 0)))) : '—']].map(([l, v]) => (
          <div key={l} className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-.02em', color: 'var(--primary)' }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 13px' }}>
        <Search size={15} color="var(--text3)" style={{ flexShrink: 0 }} />
        <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--text)' }} placeholder="Search by date or description..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}><X size={14} /></button>}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>{editId ? 'Edit Log' : 'Log Hours'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Date</label>
                <input type="date" className="inp" value={form.date} onChange={set('date')} max={todayStr()} />
              </div>
              <div className="field"><label>Time In</label><input type="time" className="inp" value={form.time_in} onChange={set('time_in')} /></div>
              <div className="field"><label>Time Out</label><input type="time" className="inp" value={form.time_out} onChange={set('time_out')} /></div>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Break (minutes)</label>
                <input type="number" className="inp" min={0} value={form.break_minutes} onChange={set('break_minutes')} />
              </div>
            </div>
            {preview > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary-bg)', border: '1px solid rgba(0,122,255,.15)', color: 'var(--primary)', borderRadius: 10, padding: '9px 13px', fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
                <Clock size={13} /> Calculated: <b>{fmtH(preview)}</b>
              </div>
            )}
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Description</label>
              <textarea className="inp" style={{ height: 76, fontSize: 14 }} placeholder="What did you work on today?" value={form.description} onChange={set('description')} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Tasks <span style={{ color: 'var(--text4)', fontWeight: 400 }}>(comma-separated)</span></label>
              <input className="inp" placeholder="Code review, Bug fix, Documentation" value={form.tasks} onChange={set('tasks')} />
            </div>
            <div className="field" style={{ marginBottom: 22 }}>
              <label>Mood — <span style={{ color: moodColor(form.mood), fontWeight: 700 }}>{moodL(form.mood)}</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(m => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, mood: m }))}
                    style={{ flex: 1, padding: '9px 4px', background: form.mood === m ? `${moodColor(m)}18` : 'var(--surface2)', border: `1.5px solid ${form.mood === m ? moodColor(m) : 'var(--border2)'}`, borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: form.mood === m ? moodColor(m) : 'var(--text3)', transition: 'all .15s' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, background: 'var(--danger-bg)', padding: '9px 12px', borderRadius: 9 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spin" /> Saving...</> : <><Check size={14} /> {editId ? 'Update' : 'Save'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 50, gap: 10, color: 'var(--text3)' }}><span className="spin spin-dark" /> Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon"><Clock size={22} /></div>
            <h3>{search ? 'No results found' : 'No logs yet'}</h3>
            <p>{search ? 'Try a different search term' : 'Click "Log Hours" to record your first entry'}</p>
            {!search && <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={openAdd}><Plus size={13} /> Log First Entry</button>}
          </div>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>In / Out</th><th>Break</th><th>Hours</th><th>Mood</th><th>Description</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{format(parseISO(l.date), 'MMM d')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{format(parseISO(l.date), 'yyyy')}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)', fontVariantNumeric: 'tabular-nums' }}>{l.time_in || '—'} – {l.time_out || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{l.break_minutes || 0}m</td>
                  <td><span className="badge badge-blue">{fmtH(l.hours_worked)}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: moodColor(l.mood || 3) }} />
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{moodL(l.mood || 3)}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{l.description || <span style={{ color: 'var(--text4)' }}>—</span>}</div>
                    {l.tasks?.length > 0 && (
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
                        {l.tasks.slice(0, 2).map((t, i) => <span key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 10, color: 'var(--text3)' }}>{t}</span>)}
                        {l.tasks.length > 2 && <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 10, color: 'var(--text3)' }}>+{l.tasks.length - 2}</span>}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(l)}><Edit3 size={13} /></button>
                      {confirmId === l.id
                        ? <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(l.id)}><Check size={13} /></button>
                        : <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(l.id)}><Trash2 size={13} /></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
