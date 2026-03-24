import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
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
      <button className="btn btn-ghost btn-icon" onClick={toggleOpen} style={{ position: 'relative', width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Bell size={18} />
        {unread.length > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            minWidth: 18, height: 18, borderRadius: 9, padding: '0 4px',
            background: 'var(--danger)', color: '#fff',
            fontSize: 10, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(255,59,48,.4)',
            animation: 'pulse 2s infinite'
          }}>{unread.length}</span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="mobile-only" onClick={() => setOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 499,
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
          }} />
          <div style={{
            position: 'fixed', top: 60, right: 12, left: 12,
            maxHeight: 'calc(100vh - 140px)', overflowY: 'auto',
            background: 'var(--surface)', backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderRadius: 16, border: '1px solid var(--glass-border)',
            boxShadow: '0 12px 40px rgba(0,0,0,.18)', animation: 'scaleIn .15s ease', zIndex: 500,
          }}
          className="notif-dropdown"
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1, borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={15} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
                {unread.length > 0 && (
                  <span style={{
                    minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
                    background: 'var(--danger)', color: '#fff', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{unread.length}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {unread.length > 0 && (
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, gap: 4, padding: '4px 10px' }} onClick={markAllRead}>
                    <CheckCheck size={13} /> Read all
                  </button>
                )}
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpen(false)} style={{ width: 28, height: 28, padding: 0 }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Items */}
            {announcements.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text3)' }}>
                <Bell size={28} style={{ opacity: .3, marginBottom: 8 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No notifications</div>
                <div style={{ fontSize: 12 }}>You're all caught up!</div>
              </div>
            ) : (
              <div style={{ padding: '4px 0' }}>
                {announcements.slice(0, 15).map(a => {
                  const isUnread = !readIds.has(a.id)
                  return (
                    <div key={a.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--border)',
                      background: isUnread ? 'var(--primary-bg)' : 'transparent',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      transition: 'background .15s'
                    }}>
                      {isUnread && (
                        <div style={{
                          width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0,
                          background: 'var(--primary)', boxShadow: '0 0 6px rgba(0,122,255,.4)'
                        }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, lineHeight: 1.3 }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {(a.content || '').slice(0, 100)}{a.content?.length > 100 ? '...' : ''}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {a.priority === 'high' && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>URGENT</span>}
                          {a.created_at ? format(parseISO(a.created_at), 'MMM d, h:mm a') : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
