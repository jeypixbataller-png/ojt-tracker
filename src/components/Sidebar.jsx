import { useState, useEffect } from 'react'
import { LayoutDashboard, Clock, CheckSquare, Settings, LogOut, Shield, Menu, X, Megaphone, StickyNote, Moon, Sun, Calendar, BarChart3, Search, Award, Target, FileText } from 'lucide-react'
import NotificationBell from './NotificationBell'

const NAV = [
  { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'logs',          label: 'Time Logs',    icon: Clock },
  { id: 'tasks',         label: 'Tasks',        icon: CheckSquare },
  { id: 'calendar',      label: 'Calendar',     icon: Calendar },
  { id: 'reports',       label: 'Reports',      icon: BarChart3 },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'notes',         label: 'Notes',        icon: StickyNote },
  { id: 'goals',         label: 'Goals',        icon: Target },
  { id: 'documents',     label: 'Documents',    icon: FileText },
  { id: 'certificate',   label: 'Certificate',  icon: Award },
  { id: 'settings',      label: 'Settings',     icon: Settings },
]

function SidebarContent({ page, setPage, profile, onLogout, totalHours, progress, isAdmin, onClose, onSearchOpen, announcements, tasks }) {
  const req   = profile?.required_hours || 500
  const overdueTasks = (tasks || []).filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date() && new Date(t.due_date).toDateString() !== new Date().toDateString())
  const items = isAdmin ? [...NAV, { id: 'admin', label: 'User Management', icon: Shield }] : NAV
  const go    = id => { setPage(id); onClose?.() }
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="sidebar-inner">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.02em' }}>OJT Tracker</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Internship System</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 6 }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', borderRadius: 12, padding: '10px 12px', marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>
          {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>
            {profile?.full_name || 'User'}
          </div>
          <div style={{ fontSize: 11, color: isAdmin ? 'var(--purple)' : 'var(--text3)', fontWeight: isAdmin ? 600 : 400 }}>
            {isAdmin ? 'Administrator' : profile?.school || 'Intern'}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 13px', marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>OJT Progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div className="prog-track" style={{ marginBottom: 7 }}>
          <div className="prog-fill" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>
          <b style={{ color: 'var(--text)' }}>{Number(totalHours).toFixed(1)}h</b>
          <span style={{ color: 'var(--text3)' }}> of {req}h</span>
        </span>
      </div>

      {/* Search + Notifications */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={() => { onSearchOpen?.(); onClose?.() }}>
          <Search size={14} /> Search
        </button>
        <NotificationBell announcements={announcements || []} />
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => go(id)}>
            <span className="nav-icon"><Icon size={16} strokeWidth={page === id ? 2.2 : 1.8} /></span>
            <span style={{ flex: 1 }}>{label}</span>
            {id === 'tasks' && overdueTasks.length > 0 && (
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{overdueTasks.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme Toggle + Sign out */}
      <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 14 }} onClick={toggleTheme}>
          {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(255,59,48,.2)', fontSize: 14 }} onClick={onLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}

export default function Sidebar(props) {
  const [open, setOpen] = useState(false)

  const bottomItems = [
    { id: 'dashboard',     label: 'Home',    icon: LayoutDashboard },
    { id: 'logs',          label: 'Logs',    icon: Clock },
    { id: 'tasks',         label: 'Tasks',   icon: CheckSquare },
    { id: 'announcements', label: 'Updates', icon: Megaphone },
    ...(props.isAdmin
      ? [{ id: 'admin', label: 'Admin', icon: Shield }]
      : [{ id: 'notes', label: 'Notes', icon: StickyNote }]
    ),
  ]

  return (
    <>
      {/* Desktop */}
      <aside className="sidebar desktop-only">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile top bar */}
      <header className="top-bar mobile-only">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-.02em' }}>OJT Tracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => props.onSearchOpen?.()} className="btn btn-ghost btn-icon btn-sm"><Search size={16} /></button>
          <NotificationBell announcements={props.announcements || []} />
          <button onClick={() => setOpen(true)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 10, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <Menu size={16} /> Menu
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="mobile-overlay mobile-only" onClick={() => setOpen(false)} />
          <div className="sidebar-drawer mobile-only">
            <SidebarContent {...props} onClose={() => setOpen(false)} />
          </div>
        </>
      )}

      {/* Mobile bottom nav */}
      <nav className="bottom-nav mobile-only">
        {bottomItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`bnav-btn ${props.page === id ? 'active' : ''}`} onClick={() => props.setPage(id)}>
            <span className="bnav-icon"><Icon size={22} strokeWidth={props.page === id ? 2.2 : 1.8} /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
