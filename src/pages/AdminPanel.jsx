import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Users, Clock, Shield, RefreshCw, Edit3, Trash2, Check, X, Search, UserX, UserCheck, AlertCircle, Send, MessageSquare } from 'lucide-react'
import { fmtH } from '../utils/helpers'
import { format } from 'date-fns'

export default function AdminPanel() {
  const [users,        setUsers]        = useState([])
  const [hourMap,      setHourMap]      = useState({})
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [selected,     setSelected]     = useState(null)
  const [userLogs,     setUserLogs]     = useState([])
  const [logsLoading,  setLogsLoading]  = useState(false)
  const [search,       setSearch]       = useState('')
  const [editUser,     setEditUser]     = useState(null)
  const [editForm,     setEditForm]     = useState({})
  const [confirmDeact, setConfirmDeact] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [feedback,     setFeedback]     = useState('')
  const [feedbackList, setFeedbackList] = useState([])
  const [fbLoading,    setFbLoading]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (pErr) { setError(pErr.message); setLoading(false); return }
    setUsers(profiles || [])
    const { data: allLogs } = await supabase.from('logs').select('user_id,hours_worked')
    if (allLogs) {
      const map = {}
      allLogs.forEach(l => { map[l.user_id] = (map[l.user_id] || 0) + Number(l.hours_worked || 0) })
      setHourMap(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function selectUser(u) {
    setSelected(u); setLogsLoading(true); setFbLoading(true)
    const { data } = await supabase.from('logs').select('*').eq('user_id', u.id).order('date', { ascending: false })
    setUserLogs(data || [])
    setLogsLoading(false)
    const { data: fb } = await supabase.from('supervisor_feedback').select('*').eq('user_id', u.id).order('created_at', { ascending: false })
    setFeedbackList(fb || [])
    setFbLoading(false)
  }

  async function addFeedback() {
    if (!feedback.trim() || !selected) return
    const { data } = await supabase.from('supervisor_feedback').insert({ user_id: selected.id, content: feedback.trim() }).select().single()
    if (data) setFeedbackList(p => [data, ...p])
    setFeedback('')
  }

  async function deleteFb(id) {
    await supabase.from('supervisor_feedback').delete().eq('id', id)
    setFeedbackList(p => p.filter(f => f.id !== id))
  }

  async function saveEdit() {
    setSaving(true)
    const { data, error } = await supabase.from('profiles').update(editForm).eq('id', editUser.id).select().single()
    if (!error && data) {
      setUsers(p => p.map(u => u.id === editUser.id ? data : u))
      if (selected?.id === editUser.id) setSelected(data)
    }
    setSaving(false); setEditUser(null)
  }

  async function deactivate(uid) {
    await supabase.from('profiles').update({ is_active: false }).eq('id', uid)
    setUsers(p => p.map(u => u.id === uid ? { ...u, is_active: false } : u))
    if (selected?.id === uid) setSelected(s => ({ ...s, is_active: false }))
    setConfirmDeact(null)
  }

  async function reactivate(uid) {
    await supabase.from('profiles').update({ is_active: true }).eq('id', uid)
    setUsers(p => p.map(u => u.id === uid ? { ...u, is_active: true } : u))
    if (selected?.id === uid) setSelected(s => ({ ...s, is_active: true }))
  }

  async function deleteLogEntry(logId) {
    const entry = userLogs.find(l => l.id === logId)
    await supabase.from('logs').delete().eq('id', logId)
    setUserLogs(p => p.filter(l => l.id !== logId))
    if (entry && selected) setHourMap(p => ({ ...p, [selected.id]: Math.max(0, (p[selected.id] || 0) - Number(entry.hours_worked || 0)) }))
  }

  const totalHours  = Object.values(hourMap).reduce((s, h) => s + h, 0)
  const activeCount = users.filter(u => u.is_active !== false).length
  const filtered    = users.filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Shield size={20} color="var(--purple)" /> User Management
          </h1>
          <p className="page-sub">Manage registered users and their OJT data</p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={loading ? { animation: 'spin .65s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(255,59,48,.15)', color: 'var(--danger)', borderRadius: 10, padding: '10px 14px', fontSize: 13, display: 'flex', gap: 8 }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />{error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[['Users', users.length, 'var(--purple)'], ['Active', activeCount, 'var(--success)'], ['Total Hours', fmtH(totalHours), 'var(--primary)'], ['Avg / User', users.length ? fmtH(totalHours / users.length) : '—', 'var(--warning)']].map(([l, v, c]) => (
          <div key={l} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-.03em', color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid" style={{ display: 'grid', gap: 14 }}>
        {/* User list */}
        <div className={`admin-list card${selected ? ' admin-hide-mobile' : ''}`} style={{
          overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '72vh',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Users size={14} color="var(--purple)" />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Users ({users.length})</span>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={13} color="var(--text3)" />
            <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: 'var(--text)' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading
              ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40, gap: 8, color: 'var(--text3)', fontSize: 13 }}><span className="spin spin-dark" /> Loading...</div>
              : filtered.length === 0
                ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No users found</div>
                : filtered.map(u => (
                    <div key={u.id} className="list-row" onClick={() => selectUser(u)}
                      style={{ cursor: 'pointer', background: selected?.id === u.id ? 'var(--primary-bg)' : 'transparent', opacity: u.is_active === false ? .5 : 1 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                        {(u.full_name || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fmtH(hourMap[u.id] || 0)} logged</div>
                      </div>
                      {u.role === 'admin' && <span className="badge badge-purple" style={{ fontSize: 10 }}>Admin</span>}
                      {u.is_active === false && <span className="badge badge-red" style={{ fontSize: 10 }}>Off</span>}
                    </div>
                  ))
            }
          </div>
        </div>

        {/* Detail */}
        <div className={`admin-detail card${!selected ? ' admin-hide-mobile' : ''}`} style={{ overflow: 'hidden', maxHeight: '72vh', display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div className="empty" style={{ flex: 1 }}>
              <div className="empty-icon"><Users size={22} /></div>
              <h3>Select a user</h3>
              <p>Click any user to view their profile and logs</p>
            </div>
          ) : (
            <>
              {/* Mobile back button */}
              <div className="admin-back-mobile" style={{ display: 'none' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)} style={{ fontSize: 13, margin: '10px 14px 0' }}>
                  ← Back to user list
                </button>
              </div>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, background: 'var(--surface2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff', flexShrink: 0 }}>
                    {(selected.full_name || selected.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>{selected.full_name || 'No name'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selected.email}</div>
                    {selected.school && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selected.school}</div>}
                    {selected.company_name && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{selected.company_name}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditUser(selected); setEditForm({ full_name: selected.full_name, required_hours: selected.required_hours || 500, role: selected.role || 'user' }) }}>
                    <Edit3 size={13} /> Edit
                  </button>
                  {selected.is_active === false
                    ? <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)', borderColor: 'rgba(52,199,89,.3)' }} onClick={() => reactivate(selected.id)}><UserCheck size={13} /> Activate</button>
                    : <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(255,59,48,.3)' }} onClick={() => setConfirmDeact(selected.id)}><UserX size={13} /> Deactivate</button>
                  }
                </div>
              </div>

              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple)' }}>
                    {Math.min(100, Math.round((hourMap[selected.id] || 0) / (selected.required_hours || 500) * 100))}%
                  </span>
                </div>
                <div className="prog-track" style={{ marginBottom: 6 }}>
                  <div className="prog-fill" style={{ width: `${Math.min(100, (hourMap[selected.id] || 0) / (selected.required_hours || 500) * 100)}%`, background: 'var(--purple)' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                  <b>{fmtH(hourMap[selected.id] || 0)}</b> <span style={{ color: 'var(--text3)' }}>of {selected.required_hours || 500}h</span>
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} color="var(--text3)" />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Time Logs ({userLogs.length})</span>
                </div>
                {logsLoading
                  ? <div style={{ display: 'flex', justifyContent: 'center', padding: 30, gap: 8, color: 'var(--text3)', fontSize: 13 }}><span className="spin spin-dark" /> Loading...</div>
                  : userLogs.length === 0
                    ? <div className="empty" style={{ padding: '28px 0' }}>
                        <div className="empty-icon"><Clock size={18} /></div>
                        <p>No logs recorded yet</p>
                      </div>
                    : userLogs.map(l => (
                        <div key={l.id} className="list-row">
                          <span style={{ fontSize: 12, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{l.date}</span>
                          <span className="badge badge-purple" style={{ flexShrink: 0 }}>{fmtH(l.hours_worked)}</span>
                          <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description || '—'}</span>
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ flexShrink: 0, color: 'var(--danger)' }} onClick={() => deleteLogEntry(l.id)}><Trash2 size={12} /></button>
                        </div>
                      ))
                }

                {/* Supervisor Feedback */}
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={13} color="var(--text3)" />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>Supervisor Feedback ({feedbackList.length})</span>
                </div>
                <div style={{ padding: '10px 20px' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <input className="inp" style={{ fontSize: 12, flex: 1 }} placeholder="Add feedback or note for this intern..." value={feedback} onChange={e => setFeedback(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFeedback()} />
                    <button className="btn btn-primary btn-sm btn-icon" onClick={addFeedback} disabled={!feedback.trim()}><Send size={12} /></button>
                  </div>
                  {fbLoading ? (
                    <div style={{ fontSize: 12, color: 'var(--text4)', padding: '6px 0' }}>Loading...</div>
                  ) : feedbackList.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text4)', padding: '6px 0' }}>No feedback yet</div>
                  ) : feedbackList.map(f => (
                    <div key={f.id} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px' }}>
                        {f.content}
                        <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 3 }}>{f.created_at ? format(new Date(f.created_at), 'MMM d, yyyy h:mm a') : ''}</div>
                      </div>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => deleteFb(f.id)}><Trash2 size={10} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>Edit User</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditUser(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
              <div className="field"><label>Full Name</label><input className="inp" value={editForm.full_name || ''} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} /></div>
              <div className="field"><label>Required Hours</label><input type="number" className="inp" min={1} value={editForm.required_hours || 500} onChange={e => setEditForm(p => ({ ...p, required_hours: Number(e.target.value) }))} /></div>
              <div className="field">
                <label>Role</label>
                <select className="inp" value={editForm.role || 'user'} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="user">User (Intern)</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? <><span className="spin" /> Saving...</> : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deactivate */}
      {confirmDeact && (
        <div className="modal-overlay" onClick={() => setConfirmDeact(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--danger)', marginBottom: 12 }}>Deactivate Account?</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>This will prevent the user from signing in. You can reactivate them at any time.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDeact(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deactivate(confirmDeact)}><UserX size={14} /> Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
