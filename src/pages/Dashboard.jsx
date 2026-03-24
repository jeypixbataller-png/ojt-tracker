import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { Clock, TrendingUp, Target, Plus, ArrowRight, Settings2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { fmtH, weeklyData, moodL, moodColor, fmtDateShort, calcStreak, calcWeekHours } from '../utils/helpers'
import { format, parseISO } from 'date-fns'
import Tilt3DCard from '../components/Tilt3DCard'
import Heatmap from '../components/Heatmap'

export default function Dashboard({ profile, logs, totalHours, tasks, setPage }) {
  const req      = profile?.required_hours || 500
  const pct      = Math.min(100, (totalHours / req) * 100)
  const remain   = Math.max(0, req - totalHours)
  const wData    = useMemo(() => weeklyData(logs, 8), [logs])
  const strk     = useMemo(() => calcStreak(logs), [logs])
  const wkH      = useMemo(() => calcWeekHours(logs), [logs])
  const today    = format(new Date(), 'yyyy-MM-dd')
  const todayLog = logs.find(l => l.date === today)
  const moodData = useMemo(() => logs.slice(0, 7).reverse().map(l => ({ d: fmtDateShort(l.date), m: l.mood || 3 })), [logs])
  const pending  = tasks.filter(t => t.status === 'todo')
  const greet    = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }

  const WIDGETS = ['stats', 'progress', 'charts', 'heatmap', 'recent']
  const WIDGET_LABELS = { stats: 'Stat Cards', progress: 'Progress Bar', charts: 'Charts', heatmap: 'Activity Heatmap', recent: 'Recent Logs & Tasks' }
  const [showCustomize, setShowCustomize] = useState(false)
  const [visibleWidgets, setVisibleWidgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dashWidgets')) || WIDGETS } catch { return WIDGETS }
  })
  function toggleWidget(w) {
    setVisibleWidgets(prev => {
      const next = prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]
      localStorage.setItem('dashWidgets', JSON.stringify(next))
      return next
    })
  }
  const vis = w => visibleWidgets.includes(w)

  return (
    <div className="page">
      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px,4vw,24px)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: 2 }}>
            {greet()}, {profile?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCustomize(!showCustomize)} title="Customize widgets">
            <Settings2 size={14} /> Customize
          </button>
          {todayLog
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--success-bg)', border: '1px solid rgba(52,199,89,.25)', color: '#1a7a30', borderRadius: 100, padding: '7px 14px', fontSize: 13, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                Logged {fmtH(todayLog.hours_worked)} today
              </div>
            : <button className="btn btn-primary btn-sm" onClick={() => setPage('logs')}><Plus size={14} /> Log Today</button>
          }
        </div>
      </div>

      {/* Widget toggles */}
      {showCustomize && (
        <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', marginRight: 4 }}>Show/Hide:</span>
          {WIDGETS.map(w => (
            <button key={w} className={`btn btn-ghost btn-sm`} onClick={() => toggleWidget(w)}
              style={{ fontSize: 12, color: vis(w) ? 'var(--primary)' : 'var(--text4)', borderColor: vis(w) ? 'var(--primary)' : undefined }}>
              {vis(w) ? <Eye size={12} /> : <EyeOff size={12} />} {WIDGET_LABELS[w]}
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}
      {vis('stats') && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        <StatCard icon={<Clock size={17} />}      label="Total Hours" value={fmtH(totalHours)} note={`${Math.round(pct)}% complete`}                                 color="var(--primary)" />
        <StatCard icon={<Target size={17} />}     label="Remaining"   value={fmtH(remain)}     note={`Goal ${req}h`}                                                  color="var(--danger)" />
        <StatCard icon={<TrendingUp size={17} />} label="This Week"   value={fmtH(wkH)}        note={logs.length ? `${logs.length} entries total` : 'No entries yet'} color="var(--success)" />
        <StatCard
          icon={<span style={{ fontWeight: 800, fontSize: 14, color: 'var(--warning)', lineHeight: 1 }}>{strk}</span>}
          label="Day Streak" value={`${strk}d`} note={strk > 0 ? 'Active streak' : 'Log daily'}
          color="var(--warning)"
        />
      </div>
      )}

      {/* Progress bar */}
      {vis('progress') && (
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>Overall Completion</div>
            <div style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 700, letterSpacing: '-.03em' }}>
              {Number(totalHours).toFixed(1)}<span style={{ color: 'var(--text3)', fontSize: 16, fontWeight: 400 }}>h / {req}h</span>
            </div>
          </div>
          <div style={{ fontSize: 'clamp(28px,5vw,38px)', fontWeight: 700, letterSpacing: '-.03em', color: 'var(--primary)' }}>{Math.round(pct)}%</div>
        </div>
        <div className="prog-track" style={{ height: 8, marginBottom: 10 }}>
          <div className="prog-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[0, 25, 50, 75, 100].map(m => (
            <span key={m} style={{ fontSize: 10, color: pct >= m ? 'var(--primary)' : 'var(--text4)', fontWeight: 500 }}>{m}%</span>
          ))}
        </div>
      </div>
      )}

      {/* Charts */}
      {vis('charts') && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-.01em' }}>Weekly Hours</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Last 8 weeks</span>
          </div>
          {wData.some(w => w.hours > 0) ? (
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={wData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#007aff" stopOpacity={.12} />
                    <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, boxShadow: 'var(--sh)' }} itemStyle={{ color: 'var(--primary)' }} labelStyle={{ color: 'var(--text2)', fontWeight: 600 }} />
                <Area type="monotone" dataKey="hours" stroke="#007aff" strokeWidth={2} fill="url(#ag)" dot={{ fill: '#007aff', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Log hours to see trends" />}
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-.01em' }}>Daily Mood</span>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Last 7 entries</span>
          </div>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={moodData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                <XAxis dataKey="d" tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: 'var(--text3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} formatter={v => [`${moodL(v)} (${v}/5)`, 'Mood']} labelStyle={{ color: 'var(--text2)', fontWeight: 600 }} />
                <Bar dataKey="m" radius={[5, 5, 0, 0]}>
                  {moodData.map((d, i) => <Cell key={i} fill={moodColor(d.m)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart text="Log entries to see mood trend" />}
        </div>
      </div>
      )}

      {/* Heatmap */}
      {vis('heatmap') && <Heatmap logs={logs} />}

      {/* Recent logs + Pending tasks */}
      {vis('recent') && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="list-row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <span style={{ fontWeight: 600, fontSize: 14, flex: 1, letterSpacing: '-.01em' }}>Recent Logs</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('logs')}>View all <ArrowRight size={12} /></button>
          </div>
          {logs.length === 0
            ? <div className="empty" style={{ padding: '32px 20px' }}>
                <div className="empty-icon"><Clock size={22} /></div>
                <h3>No logs yet</h3>
                <p>Start recording your daily hours</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setPage('logs')}><Plus size={13} /> Log First Entry</button>
              </div>
            : logs.slice(0, 5).map(l => (
                <div key={l.id} className="list-row">
                  <div style={{ textAlign: 'center', minWidth: 30, flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1, color: 'var(--primary)' }}>{format(parseISO(l.date), 'd')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{format(parseISO(l.date), 'MMM')}</div>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{fmtH(l.hours_worked)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description || 'No description'}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: moodColor(l.mood || 3), flexShrink: 0 }} title={moodL(l.mood || 3)} />
                </div>
              ))
          }
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="list-row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
            <span style={{ fontWeight: 600, fontSize: 14, flex: 1, letterSpacing: '-.01em' }}>Pending Tasks</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('tasks')}>View all <ArrowRight size={12} /></button>
          </div>
          {pending.length === 0
            ? <div className="empty" style={{ padding: '32px 20px' }}>
                <div className="empty-icon"><span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text4)' }}>0</span></div>
                <h3>All caught up</h3>
                <p>No pending tasks right now</p>
              </div>
            : pending.slice(0, 5).map(t => (
                <div key={t.id} className="list-row">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: t.priority === 'high' ? 'var(--danger)' : t.priority === 'low' ? 'var(--success)' : 'var(--warning)' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    {t.due_date && <div style={{ fontSize: 11, color: 'var(--text3)' }}>Due {fmtDateShort(t.due_date)}</div>}
                  </div>
                  <span className={`badge ${t.priority === 'high' ? 'badge-red' : t.priority === 'low' ? 'badge-green' : 'badge-yellow'}`}>{t.priority}</span>
                </div>
              ))
          }
        </div>
      </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, note, color }) {
  return (
    <Tilt3DCard className="card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-.03em', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{note}</div>
    </Tilt3DCard>
  )
}

function EmptyChart({ text }) {
  return (
    <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)', fontSize: 13 }}>{text}</div>
  )
}
