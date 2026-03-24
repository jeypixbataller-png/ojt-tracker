import { useState } from 'react'
import { Bell, Plus, Trash2, X, Check, Megaphone, AlertTriangle, Info, ChevronDown } from 'lucide-react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

const PRI = {
  urgent: { label: 'Urgent', color: 'var(--danger)',  bg: 'var(--danger-bg)',  badge: 'badge-red',    icon: <AlertTriangle size={14} /> },
  high:   { label: 'High',   color: 'var(--warning)', bg: 'var(--warning-bg)', badge: 'badge-yellow', icon: <Bell size={14} /> },
  normal: { label: 'Normal', color: 'var(--primary)', bg: 'var(--primary-bg)', badge: 'badge-blue',   icon: <Info size={14} /> },
  low:    { label: 'Low',    color: 'var(--success)', bg: 'var(--success-bg)', badge: 'badge-green',  icon: <Info size={14} /> },
}

function timeAgo(ts) {
  try { return formatDistanceToNow(parseISO(ts), { addSuffix: true }) } catch { return '' }
}

export default function AnnouncementsPage({ isAdmin, profile, announcements, addAnnouncement, deleteAnnouncement, loading }) {
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [expanded,  setExpanded]  = useState({})
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function post() {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and message are required.'); return }
    setSaving(true); setError('')
    const { error } = await addAnnouncement({
      title: form.title.trim(), content: form.content.trim(),
      priority: form.priority, adminId: profile?.id,
      adminName: profile?.full_name || 'Admin',
    })
    setSaving(false)
    if (error) { setError(error.message || 'Failed to post.'); return }
    setForm({ title: '', content: '', priority: 'normal' })
    setShowForm(false)
  }

  async function remove(id) { await deleteAnnouncement(id); setConfirmId(null) }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-sub">{isAdmin ? 'Broadcast messages to all users in real time' : 'Stay updated with the latest notices from admin'}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setError('') }}>
            <Plus size={15} /> New Announcement
          </button>
        )}
      </div>

      {/* Post modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>New Announcement</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Title</label>
              <input className="inp" placeholder="Announcement title" value={form.title} onChange={set('title')} autoFocus />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Message</label>
              <textarea className="inp" style={{ height: 110, fontSize: 14 }} placeholder="Write your message here..." value={form.content} onChange={set('content')} />
            </div>
            <div className="field" style={{ marginBottom: 22 }}>
              <label>Priority</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 4 }}>
                {Object.entries(PRI).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(p => ({ ...p, priority: k }))}
                    style={{ padding: '9px 4px', border: `1.5px solid ${form.priority === k ? v.color : 'var(--border2)'}`, borderRadius: 'var(--r)', background: form.priority === k ? v.bg : 'var(--surface2)', color: form.priority === k ? v.color : 'var(--text2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .15s', textAlign: 'center' }}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, background: 'var(--danger-bg)', padding: '9px 12px', borderRadius: 9 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={post} disabled={saving || !form.title.trim() || !form.content.trim()}>
                {saving ? <><span className="spin" /> Posting...</> : <><Megaphone size={14} /> Post</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 10, color: 'var(--text3)' }}>
          <span className="spin spin-dark" /> Loading...
        </div>
      )}

      {!loading && announcements.length === 0 && (
        <div className="card">
          <div className="empty">
            <div className="empty-icon"><Megaphone size={22} /></div>
            <h3>No announcements</h3>
            <p>{isAdmin ? 'Post your first announcement above' : 'No announcements from admin yet'}</p>
          </div>
        </div>
      )}

      {!loading && announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {announcements.map(a => {
            const p    = PRI[a.priority] || PRI.normal
            const isEx = expanded[a.id]
            const long = a.content.length > 200
            return (
              <div key={a.id} className="card" style={{ overflow: 'hidden', borderLeft: `3px solid ${p.color}` }}>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: p.bg, color: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, flexWrap: 'wrap' }}>
                          <span className={`badge ${p.badge}`}>{p.label}</span>
                          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{a.admin_name || 'Admin'} · {timeAgo(a.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {long && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setExpanded(s => ({ ...s, [a.id]: !s[a.id] }))}>
                          <ChevronDown size={14} style={{ transform: isEx ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                        </button>
                      )}
                      {isAdmin && (
                        confirmId === a.id
                          ? <button className="btn btn-danger btn-icon btn-sm" onClick={() => remove(a.id)}><Check size={13} /></button>
                          : <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setConfirmId(a.id)}><Trash2 size={13} /></button>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...(long && !isEx ? { maxHeight: 62, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)' } : {}) }}>
                    {a.content}
                  </div>
                  {long && !isEx && (
                    <button onClick={() => setExpanded(s => ({ ...s, [a.id]: true }))} style={{ marginTop: 6, background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                      Read more
                    </button>
                  )}

                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text4)' }}>
                    {format(parseISO(a.created_at), 'MMMM d, yyyy · h:mm a')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
