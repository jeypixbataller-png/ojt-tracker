import { useState } from 'react'
import { Plus, Trash2, X, Target, CheckCircle2, Edit3 } from 'lucide-react'
import { format } from 'date-fns'

export default function GoalsPage({ goals, loading, addGoal, updateGoal, deleteGoal }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', target: '', current: '', unit: 'hours', deadline: '' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function openNew() {
    setEditId(null)
    setForm({ title: '', target: '', current: '', unit: 'hours', deadline: '' })
    setShowForm(true)
    setError('')
  }

  function openEdit(g) {
    setEditId(g.id)
    setForm({ title: g.title, target: g.target || '', current: g.current || '', unit: g.unit || 'hours', deadline: g.deadline || '' })
    setShowForm(true)
    setError('')
  }

  async function submit() {
    if (!form.title.trim()) { setError('Goal title is required'); return }
    if (!form.target || Number(form.target) <= 0) { setError('Target must be > 0'); return }
    setSaving(true); setError('')
    if (editId) {
      const { error } = await updateGoal(editId, { title: form.title, target: Number(form.target), current: Number(form.current) || 0, unit: form.unit, deadline: form.deadline || null })
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await addGoal(form)
      if (error) { setError(error.message); setSaving(false); return }
    }
    setSaving(false)
    setShowForm(false)
  }

  function toggleComplete(g) {
    updateGoal(g.id, { completed: !g.completed, current: !g.completed ? g.target : g.current })
  }

  const completed = goals.filter(g => g.completed)
  const active = goals.filter(g => !g.completed)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-sub">Set and track your OJT goals</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={15} /> Add Goal</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editId ? 'Edit Goal' : 'New Goal'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Title</label>
              <input className="inp" placeholder="e.g. Complete 500 OJT hours" value={form.title} onChange={set('title')} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="field">
                <label>Target</label>
                <input type="number" className="inp" placeholder="100" value={form.target} onChange={set('target')} min="1" />
              </div>
              <div className="field">
                <label>Current</label>
                <input type="number" className="inp" placeholder="0" value={form.current} onChange={set('current')} min="0" />
              </div>
              <div className="field">
                <label>Unit</label>
                <select className="inp" value={form.unit} onChange={set('unit')}>
                  <option value="hours">Hours</option>
                  <option value="tasks">Tasks</option>
                  <option value="days">Days</option>
                  <option value="projects">Projects</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 22 }}>
              <label>Deadline <span style={{ color: 'var(--text4)', fontWeight: 400 }}>(optional)</span></label>
              <input type="date" className="inp" value={form.deadline} onChange={set('deadline')} />
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, background: 'var(--danger-bg)', padding: '9px 12px', borderRadius: 9 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>
                {saving ? <><span className="spin" /> Saving...</> : editId ? 'Save Changes' : <><Plus size={14} /> Add Goal</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 50, gap: 10, color: 'var(--text3)' }}><span className="spin spin-dark" /> Loading...</div>
      ) : goals.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--text4)' }}>
            <Target size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No goals yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>Set goals to stay on track with your internship</p>
          <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14} /> Create Goal</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
              {active.map(g => <GoalCard key={g.id} goal={g} onEdit={() => openEdit(g)} onDelete={() => deleteGoal(g.id)} onToggle={() => toggleComplete(g)} onUpdate={updateGoal} />)}
            </div>
          )}
          {completed.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Completed ({completed.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
                {completed.map(g => <GoalCard key={g.id} goal={g} onEdit={() => openEdit(g)} onDelete={() => deleteGoal(g.id)} onToggle={() => toggleComplete(g)} onUpdate={updateGoal} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function GoalCard({ goal, onEdit, onDelete, onToggle, onUpdate }) {
  const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
  const isOverdue = goal.deadline && !goal.completed && new Date(goal.deadline) < new Date()

  function handleIncrement() {
    const next = Math.min(goal.current + 1, goal.target)
    onUpdate(goal.id, { current: next, completed: next >= goal.target })
  }

  return (
    <div className="card" style={{ padding: '18px 20px', opacity: goal.completed ? 0.7 : 1, borderLeft: isOverdue ? '3px solid var(--danger)' : goal.completed ? '3px solid var(--success)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onToggle} style={{ color: goal.completed ? 'var(--success)' : 'var(--text4)', flexShrink: 0, marginTop: 1 }}>
          <CheckCircle2 size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, textDecoration: goal.completed ? 'line-through' : 'none', letterSpacing: '-.01em' }}>{goal.title}</div>
          {goal.deadline && (
            <div style={{ fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--text3)', marginTop: 2 }}>
              {isOverdue ? 'Overdue — ' : 'Due '}
              {format(new Date(goal.deadline), 'MMM d, yyyy')}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Edit3 size={12} /></button>
          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={onDelete}><Trash2 size={12} /></button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{goal.current} / {goal.target} {goal.unit}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? 'var(--success)' : 'var(--primary)' }}>{Math.round(pct)}%</span>
      </div>
      <div className="prog-track" style={{ height: 6, marginBottom: 10 }}>
        <div className="prog-fill" style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--success)' : undefined }} />
      </div>

      {!goal.completed && (
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }} onClick={handleIncrement}>
          <Plus size={12} /> Increment
        </button>
      )}
    </div>
  )
}
