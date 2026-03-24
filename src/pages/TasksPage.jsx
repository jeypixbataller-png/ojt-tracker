import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Check, ChevronDown, ChevronUp, AlertTriangle, MessageSquare, Send } from 'lucide-react'
import { fmtDateShort } from '../utils/helpers'
import { isAfter, parseISO, isToday, differenceInDays, format } from 'date-fns'
import { supabase } from '../lib/supabase'

const COLS = [
  { id: 'todo',        label: 'To Do',       color: 'var(--primary)' },
  { id: 'in-progress', label: 'In Progress', color: 'var(--warning)' },
  { id: 'done',        label: 'Done',        color: 'var(--success)' },
]

export default function TasksPage({ tasks, addTask, updateTask, deleteTask, loading, userId }) {
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', due_date: '', status: 'todo' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function submit() {
    if (!form.title.trim()) { setError('Task title is required'); return }
    setSaving(true); setError('')
    const { error } = await addTask(form)
    setSaving(false)
    if (error) { setError(error.message || 'Failed to add task'); return }
    setForm({ title: '', description: '', priority: 'normal', due_date: '', status: 'todo' })
    setShowForm(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-sub">Track your OJT tasks and progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setError('') }}>
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* Counts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COLS.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 13px', fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
            {tasks.filter(t => t.status === c.id).length} {c.label}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>New Task</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Title</label>
              <input className="inp" placeholder="What needs to be done?" value={form.title} onChange={set('title')} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Description <span style={{ color: 'var(--text4)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="inp" style={{ height: 72, fontSize: 14 }} placeholder="Additional details..." value={form.description} onChange={set('description')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
              <div className="field">
                <label>Priority</label>
                <select className="inp" value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select className="inp" value={form.status} onChange={set('status')}>
                  {COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Due Date</label>
                <input type="date" className="inp" value={form.due_date} onChange={set('due_date')} />
              </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, background: 'var(--danger-bg)', padding: '9px 12px', borderRadius: 9 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>
                {saving ? <><span className="spin" /> Adding...</> : <><Plus size={14} /> Add Task</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 50, gap: 10, color: 'var(--text3)' }}><span className="spin spin-dark" /> Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          {COLS.map(col => (
            <div key={col.id} className="kanban-col">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{col.label}</span>
                </div>
                <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '1px 7px', fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text4)', textAlign: 'center', padding: '18px 0', border: '1px dashed var(--border)', borderRadius: 10 }}>No tasks</div>
                )}
                {tasks.filter(t => t.status === col.id).map(t => (
                  <TaskCard key={t.id} task={t} updateTask={updateTask} deleteTask={deleteTask} cols={COLS} userId={userId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, updateTask, deleteTask, cols, userId }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const priColor = task.priority === 'high' ? 'var(--danger)' : task.priority === 'low' ? 'var(--success)' : 'var(--warning)'
  const isOverdue = task.due_date && task.status !== 'done' && isAfter(new Date(), parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
  const isDueToday = task.due_date && task.status !== 'done' && isToday(parseISO(task.due_date))
  const dueSoon = task.due_date && task.status !== 'done' && !isOverdue && !isDueToday && differenceInDays(parseISO(task.due_date), new Date()) <= 3

  useEffect(() => {
    if (!open) return
    setLoadingComments(true)
    supabase.from('task_comments').select('*').eq('task_id', task.id).order('created_at', { ascending: true })
      .then(({ data }) => { setComments(data || []); setLoadingComments(false) })
  }, [open, task.id])

  async function addComment() {
    if (!newComment.trim()) return
    const { data } = await supabase.from('task_comments').insert({ task_id: task.id, user_id: userId, content: newComment.trim() }).select().single()
    if (data) setComments(p => [...p, data])
    setNewComment('')
  }

  async function deleteComment(cid) {
    await supabase.from('task_comments').delete().eq('id', cid)
    setComments(p => p.filter(c => c.id !== cid))
  }

  return (
    <div className="card" style={{ padding: '11px 13px', borderLeft: isOverdue ? '3px solid var(--danger)' : isDueToday ? '3px solid var(--warning)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ width: 3, height: 28, borderRadius: 2, background: priColor, flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.35, letterSpacing: '-.01em' }}>{task.title}</div>
          {task.description && <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', lineHeight: 1.5 }}>{task.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteTask(task.id)}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Move to</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {cols.filter(c => c.id !== task.status).map(c => (
              <button key={c.id} className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, borderColor: c.color, color: c.color }}
                onClick={() => { updateTask(task.id, { status: c.id }); setOpen(false) }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Comments */}
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageSquare size={10} /> Comments {comments.length > 0 && `(${comments.length})`}
          </div>
          {loadingComments ? (
            <div style={{ fontSize: 12, color: 'var(--text4)', padding: '4px 0' }}>Loading...</div>
          ) : (
            <>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)', background: 'var(--surface2)', borderRadius: 8, padding: '6px 9px' }}>
                    {c.content}
                    <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>{format(new Date(c.created_at), 'MMM d, h:mm a')}</div>
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)', flexShrink: 0 }} onClick={() => deleteComment(c.id)}><Trash2 size={10} /></button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 4 }}>
                <input className="inp" style={{ fontSize: 12, padding: '5px 8px' }} placeholder="Add comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} />
                <button className="btn btn-primary btn-sm btn-icon" onClick={addComment} disabled={!newComment.trim()}><Send size={12} /></button>
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
        {task.due_date && (
          <span style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : isDueToday ? 'var(--warning)' : 'var(--text3)', fontWeight: isOverdue || isDueToday ? 600 : 400, display: 'flex', alignItems: 'center', gap: 3 }}>
            {isOverdue && <AlertTriangle size={10} />}
            {isOverdue ? 'Overdue' : isDueToday ? 'Due today' : dueSoon ? 'Due soon' : `Due ${fmtDateShort(task.due_date)}`}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <span className={`badge ${task.priority === 'high' ? 'badge-red' : task.priority === 'low' ? 'badge-green' : 'badge-yellow'}`}>{task.priority}</span>
          {task.status === 'done' && <span className="badge badge-green"><Check size={9} /> Done</span>}
          {isOverdue && <span className="badge badge-red"><AlertTriangle size={9} /> Overdue</span>}
        </div>
      </div>
    </div>
  )
}
