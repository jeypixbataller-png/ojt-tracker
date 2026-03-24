import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useLogs, useTasks, useNotes, useAnnouncements } from './hooks/useData'
import AuthPage          from './pages/AuthPage'
import LandingPage       from './pages/LandingPage'
import Sidebar           from './components/Sidebar'
import Toast             from './components/Toast'
import AnnouncementPopup from './components/AnnouncementPopup'
import GlobalSearch      from './components/GlobalSearch'
import NotificationBell  from './components/NotificationBell'
import Dashboard         from './pages/Dashboard'
import LogsPage          from './pages/LogsPage'
import TasksPage         from './pages/TasksPage'
import NotesPage         from './pages/NotesPage'
import SettingsPage      from './pages/SettingsPage'
import AdminPanel        from './pages/AdminPanel'
import AnnouncementsPage from './pages/AnnouncementsPage'
import CalendarView      from './pages/CalendarView'
import ReportsPage       from './pages/ReportsPage'
import CertificatePage   from './pages/CertificatePage'


export default function App() {
  const { user, profile, loading, isAdmin, signIn, signUp, signOut, updateProfile, resetPassword } = useAuth()
  const [page,  setPage]  = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)

  const { logs, addLog, updateLog, deleteLog, totalHours, loading: logsLoading }             = useLogs(user?.id)
  const { tasks, addTask, updateTask, deleteTask, loading: tasksLoading }                     = useTasks(user?.id)
  const { notes, addNote, updateNote, deleteNote, loading: notesLoading }                   = useNotes(user?.id)
  const { announcements, addAnnouncement, deleteAnnouncement, loading: annLoading,
          popupAnn, dismissPopup }                                                            = useAnnouncements()

  const progress = Math.min(100, (totalHours / (profile?.required_hours || 500)) * 100)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function wrap(fn, successMsg) {
    const r = await fn()
    if (r?.error) showToast(r.error.message || 'Something went wrong', 'error')
    else if (successMsg) showToast(successMsg)
    return r
  }

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#f2f2f7' }}>
      <div style={{ width: 44, height: 44, border: '3px solid #e5e5ea', borderTopColor: '#007aff', borderRadius: '50%', animation: 'spin .65s linear infinite' }} />
      <span style={{ color: '#8e8e93', fontSize: 14, fontWeight: 500 }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // ── Landing / Auth ──
  if (!user && showLanding) return <LandingPage onGetStarted={() => setShowLanding(false)} />
  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} onBackToLanding={() => setShowLanding(true)} />

  // ── Deactivated ──
  if (profile?.is_active === false) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f2f2f7', padding: 24, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ffebea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        🔒
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Account Suspended</h2>
      <p style={{ color: '#8e8e93', fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
        Your account has been deactivated by an administrator. Please contact your supervisor for assistance.
      </p>
      <button
        onClick={signOut}
        style={{ marginTop: 8, padding: '9px 20px', background: '#fff', border: '1px solid #e5e5ea', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#3a3a3c' }}
      >
        Sign Out
      </button>
    </div>
  )

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard profile={profile} logs={logs} totalHours={totalHours} tasks={tasks} setPage={setPage} />
      case 'logs':
        return (
          <LogsPage
            logs={logs} profile={profile} loading={logsLoading}
            addLog={f => wrap(() => addLog(f), 'Log saved')}
            updateLog={(id, f) => wrap(() => updateLog(id, f), 'Log updated')}
            deleteLog={id => wrap(() => deleteLog(id), 'Log removed')}
          />
        )
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks} loading={tasksLoading} userId={user?.id}
            addTask={t => wrap(() => addTask(t), 'Task added')}
            updateTask={(id, c) => wrap(() => updateTask(id, c))}
            deleteTask={id => wrap(() => deleteTask(id), 'Task removed')}
          />
        )
      case 'announcements':
        return (
          <AnnouncementsPage
            isAdmin={isAdmin} profile={profile} announcements={announcements} loading={annLoading}
            addAnnouncement={a => wrap(() => addAnnouncement(a), 'Announcement posted')}
            deleteAnnouncement={id => wrap(() => deleteAnnouncement(id), 'Announcement removed')}
          />
        )
      case 'notes':
        return (
          <NotesPage
            notes={notes} loading={notesLoading}
            addNote={n => wrap(() => addNote(n), 'Note saved')}
            updateNote={(id, c) => wrap(() => updateNote(id, c), 'Note updated')}
            deleteNote={id => wrap(() => deleteNote(id), 'Note removed')}
          />
        )
      case 'settings':
        return (
          <SettingsPage
            profile={profile} logs={logs}
            updateProfile={c => wrap(() => updateProfile(c), 'Profile saved')}
          />
        )
      case 'admin':
        return isAdmin
          ? <AdminPanel />
          : <Dashboard profile={profile} logs={logs} totalHours={totalHours} tasks={tasks} setPage={setPage} />
      case 'calendar':
        return <CalendarView logs={logs} setPage={setPage} />
      case 'reports':
        return <ReportsPage logs={logs} tasks={tasks} profile={profile} />
      case 'certificate':
        return <CertificatePage profile={profile} totalHours={totalHours} />
      default:
        return <Dashboard profile={profile} logs={logs} totalHours={totalHours} tasks={tasks} setPage={setPage} />
    }
  }

  return (
    <div className="layout">
      <Sidebar
        page={page} setPage={setPage} profile={profile}
        onLogout={signOut} totalHours={totalHours}
        progress={progress} isAdmin={isAdmin}
        onSearchOpen={() => setSearchOpen(true)}
        announcements={announcements}
        tasks={tasks}
      />
      <main className="main">
        {renderPage()}
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <AnnouncementPopup announcement={popupAnn} onDismiss={dismissPopup} />
      {searchOpen && (
        <GlobalSearch
          logs={logs} tasks={tasks} notes={notes} announcements={announcements}
          setPage={setPage} onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  )
}
