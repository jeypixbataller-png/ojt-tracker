import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, Clock, CheckSquare, StickyNote, Megaphone } from 'lucide-react'
import { fmtDateShort } from '../utils/helpers'

export default function GlobalSearch({ logs, tasks, notes, announcements, setPage, onClose }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const results = useMemo(() => {
    if (!q.trim()) return []
    const term = q.toLowerCase()
    const r = []
    logs?.forEach(l => {
      if ((l.description || '').toLowerCase().includes(term) || (l.date || '').includes(term))
        r.push({ type: 'log', icon: Clock, page: 'logs', title: l.description || `Log on ${l.date}`, sub: fmtDateShort(l.date), id: l.id })
    })
    tasks?.forEach(t => {
      if ((t.title || '').toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term))
        r.push({ type: 'task', icon: CheckSquare, page: 'tasks', title: t.title, sub: `${t.status} · ${t.priority}`, id: t.id })
    })
    notes?.forEach(n => {
      if ((n.title || '').toLowerCase().includes(term) || (n.content || '').toLowerCase().includes(term))
        r.push({ type: 'note', icon: StickyNote, page: 'notes', title: n.title || 'Untitled Note', sub: n.content?.slice(0, 60), id: n.id })
    })
    announcements?.forEach(a => {
      if ((a.title || '').toLowerCase().includes(term) || (a.content || '').toLowerCase().includes(term))
        r.push({ type: 'announcement', icon: Megaphone, page: 'announcements', title: a.title, sub: a.content?.slice(0, 60), id: a.id })
    })
    return r.slice(0, 20)
  }, [q, logs, tasks, notes, announcements])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520, padding: 0, maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <Search size={18} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          <input ref={inputRef} className="inp" style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, fontSize: 16 }}
            placeholder="Search logs, tasks, notes..." value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 56px)' }}>
          {q.trim() && results.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No results for "{q}"</div>
          )}
          {results.map((r, i) => (
            <button key={`${r.type}-${r.id}`}
              onClick={() => { setPage(r.page); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px',
                width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', textAlign: 'left', transition: 'background .1s', fontFamily: 'var(--font)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0 }}>
                <r.icon size={14} />
              </span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>
              </div>
              <span className={`badge ${r.type === 'log' ? 'badge-blue' : r.type === 'task' ? 'badge-yellow' : r.type === 'note' ? 'badge-purple' : 'badge-green'}`}>{r.type}</span>
            </button>
          ))}
          {!q.trim() && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text4)', fontSize: 13 }}>
              Type to search across all your data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
