import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Clock, Mail } from 'lucide-react'

export default function AuthPage({ onSignIn, onSignUp, onResetPassword }) {
  const [tab,      setTab]      = useState('signin')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', school: '' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function submit() {
    setError(''); setInfo('')
    if (!form.email.trim()) { setError('Email address is required.'); return }
    if (!form.password)     { setError('Password is required.'); return }
    if (tab === 'signup' && !form.fullName.trim()) { setError('Full name is required.'); return }
    setLoading(true)
    const result = tab === 'signin'
      ? await onSignIn({ email: form.email.trim(), password: form.password })
      : await onSignUp({ email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), school: form.school.trim() })
    if (result?.error) setError(result.error.message || 'Something went wrong. Please try again.')
    else if (tab === 'signup') setInfo('Account created! Please check your email for a verification link before signing in.')
    setLoading(false)
  }

  async function handleReset() {
    setError(''); setInfo('')
    if (!form.email.trim()) { setError('Enter your email address first.'); return }
    setLoading(true)
    const { error } = await onResetPassword(form.email.trim())
    setLoading(false)
    if (error) setError(error.message)
    else setInfo('Password reset link sent. Check your inbox.')
  }

  function switchTab(t) { setTab(t); setError(''); setInfo('') }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(0,122,255,.3)' }}>
            <Clock size={28} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 4 }}>OJT Tracker</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Internship Management System</p>
        </div>

        {/* Segmented tabs */}
        <div className="seg-ctrl">
          <button className={`seg-btn ${tab === 'signin' ? 'active' : ''}`} onClick={() => switchTab('signin')}>Sign In</button>
          <button className={`seg-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>Create Account</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'signup' && (
            <>
              <div className="field">
                <label>Full Name</label>
                <input className="inp" placeholder="Juan dela Cruz" value={form.fullName} onChange={set('fullName')} autoComplete="name" />
              </div>
              <div className="field">
                <label>School / University</label>
                <input className="inp" placeholder="e.g. MSU-IIT, DLSU, PUP" value={form.school} onChange={set('school')} />
              </div>
            </>
          )}
          <div className="field">
            <label>Email Address</label>
            <input className="inp" type="email" placeholder="you@gmail.com" value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="field">
            <label>Password</label>
            <div className="inp-group">
              <input
                className="inp" type={showPass ? 'text' : 'password'}
                placeholder="Minimum 6 characters" value={form.password}
                onChange={set('password')} autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button className="inp-icon" type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Email verification notice */}
        {tab === 'signup' && (
          <div style={{ marginTop: 16, display: 'flex', gap: 10, background: 'var(--primary-bg)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(0,122,255,.18)' }}>
            <Mail size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginBottom: 3 }}>Verify Your Email</p>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
                After signing up, open your <strong>Gmail</strong> or email inbox and click the confirmation link before signing in.
              </p>
            </div>
          </div>
        )}

        {/* Error / Info */}
        {error && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--danger-bg)', border: '1px solid rgba(255,59,48,.18)', color: 'var(--danger)', borderRadius: 10, padding: '10px 13px', fontSize: 13 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
          </div>
        )}
        {info && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--success-bg)', border: '1px solid rgba(52,199,89,.2)', color: '#1a7a30', borderRadius: 10, padding: '10px 13px', fontSize: 13 }}>
            <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {info}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: '12px' }}
          onClick={submit} disabled={loading}
        >
          {loading
            ? <><span className="spin" /> {tab === 'signin' ? 'Signing in...' : 'Creating account...'}</>
            : tab === 'signin' ? 'Sign In' : 'Create Account'
          }
        </button>

        {tab === 'signin' && (
          <button onClick={handleReset} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'center', fontWeight: 500, padding: '4px' }}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  )
}
