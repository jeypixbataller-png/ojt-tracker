import { Bell, X, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const PRI_COLOR = { urgent: '#ff3b30', high: '#ff9500', normal: '#007aff', low: '#34c759' }

export default function AnnouncementPopup({ announcement, onDismiss }) {
  if (!announcement) return null
  const color    = PRI_COLOR[announcement.priority] || PRI_COLOR.normal
  const isUrgent = announcement.priority === 'urgent'

  return (
    <div className="modal-overlay" onClick={onDismiss} style={{ zIndex: 700 }}>
      <div
        className="modal"
        style={{ maxWidth: 440, borderTop: `4px solid ${color}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isUrgent ? <AlertTriangle size={18} color={color} /> : <Bell size={18} color={color} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
              {isUrgent ? 'Urgent Announcement' : 'New Announcement'}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3, margin: 0 }}>
              {announcement.title}
            </h2>
          </div>
          <button onClick={onDismiss} style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 6, flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 20 }}>
          {announcement.content}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Posted by <span style={{ fontWeight: 600, color: 'var(--text2)' }}>{announcement.admin_name || 'Admin'}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 1 }}>
              {format(parseISO(announcement.created_at), 'MMM d, yyyy · h:mm a')}
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onDismiss} style={{ padding: '8px 20px' }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
