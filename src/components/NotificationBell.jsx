import { useState, useRef, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function NotificationBell({ announcements }) {
  const [open, setOpen] = useState(false)
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ojt-read-notifs') || '[]')) } catch { return new Set() }
  })
  const ref = useRef(null)

  const unread = announcements.filter(a => !readIds.has(a.id))

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function markAllRead() {
    const ids = announcements.map(a => a.id)
    setReadIds(new Set(ids))
    localStorage.setItem('ojt-read-notifs', JSON.stringify(ids))
  }

  function toggleOpen() {
    setOpen(o => !o)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-icon" onClick={toggleOpen} style={{ position: 'relative' }}>
        <Bell size={18} />
        {unread.length > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--danger)', color: '#fff',
            fontSize: 10, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>{unread.length}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 320, maxHeight: 400, overflowY: 'auto',
          background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRadius: 'var(--r-lg)', border: '1px solid var(--glass-border)',
          boxShadow: 'var(--sh-lg)', animation: 'scaleIn .15s ease', zIndex: 500,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
            {unread.length > 0 && (
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          {announcements.length === 0 ? (
            <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No notifications</div>
          ) : (
            announcements.slice(0, 10).map(a => (
              <div key={a.id} style={{
                padding: '10px 14px', borderBottom: '1px solid var(--border)',
                background: readIds.has(a.id) ? 'transparent' : 'var(--primary-bg)',
                transition: 'background .15s'
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{(a.content || '').slice(0, 80)}{a.content?.length > 80 ? '...' : ''}</div>
                <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 4 }}>
                  {a.created_at ? format(parseISO(a.created_at), 'MMM d, h:mm a') : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
