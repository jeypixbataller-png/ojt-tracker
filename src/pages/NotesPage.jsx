import { useState } from 'react'
import { Plus, Trash2, X, StickyNote, Edit3 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

const COLORS = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#00c7be']

export default function NotesPage({ notes, addNote, updateNote, deleteNote, loading }) {
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState({ title: '', content: '', color: '#007aff' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function openNew() {
    setEditId(null)
    setForm({ title: '', content: '', color: '#007aff' })
    setShowForm(true)
    setError('')
  }

  function openEdit(n) {
    setEditId(n.id)
    setForm({ title: n.title || '', content: n.content || '', color: n.color || '#007aff' })
    setShowForm(true)
    setError('')
  }

  async function submit() {
    if (!form.content.trim()) { setError('Note content is required'); return }
    setSaving(true); setError('')
    const { error } = editId
      ? await updateNote(editId, form)
      : await addNote(form)
    setSaving(false)
    if (error) { setError(error.message || 'Failed to save note'); return }
    setForm({ title: '', content: '', color: '#007aff' })
    setShowForm(false)
    setEditId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-sub">Quick notes and reminders for your OJT</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={15} /> Add Note
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditId(null) }}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>{editId ? 'Edit Note' : 'New Note'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowForm(false); setEditId(null) }}><X size={16} /></button>
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Title <span style={{ color: 'var(--text4)', fontWeight: 400 }}>(optional)</span></label>
              <input className="inp" placeholder="Note title" value={form.title} onChange={set('title')} autoFocus />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Content</label>
              <textarea className="inp" style={{ height: 110, fontSize: 14 }} placeholder="Write your note here..." value={form.content} onChange={set('content')} />
            </div>
            <div className="field" style={{ marginBottom: 22 }}>
              <label>Color</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer', transition: 'transform .15s', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, background: 'var(--danger-bg)', padding: '9px 12px', borderRadius: 9 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving || !form.content.trim()}>
                {saving ? <><span className="spin" /> Saving...</> : <><StickyNote size={14} /> {editId ? 'Update' : 'Save Note'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 50, gap: 10, color: 'var(--text3)' }}><span className="spin spin-dark" /> Loading...</div>
      ) : notes.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon"><StickyNote size={22} /></div>
            <h3>No notes yet</h3>
            <p>Add quick notes and reminders for your internship</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={openNew}><Plus size={13} /> Add First Note</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 13 }}>
          {notes.map(n => (
            <div key={n.id} className="card note-card" style={{ overflow: 'hidden', borderTop: `3px solid ${n.color}`, cursor: 'pointer' }} onClick={() => openEdit(n)}>
              <div style={{ padding: '14px 15px' }}>
                {n.title && <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 7, color: n.color, letterSpacing: '-.01em' }}>{n.title}</div>}
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text4)' }}>{format(parseISO(n.created_at), 'MMM d, yyyy')}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); openEdit(n) }}><Edit3 size={12} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); deleteNote(n.id) }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
