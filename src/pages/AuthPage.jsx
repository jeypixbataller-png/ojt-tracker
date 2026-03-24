import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle, Clock, Mail, ArrowLeft } from 'lucide-react'

export default function AuthPage({ onSignIn, onSignUp, onResetPassword, onBackToLanding }) {
  const [tab,      setTab]      = useState('signin')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [info,     setInfo]     = useState('')
  const [showPass, setShowPass] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [confirmNotice, setConfirmNotice] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', fullName: '', school: '' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function submit() {
    setError(''); setInfo(''); setConfirmNotice(false)
    if (!form.email.trim()) { setError('Email address is required.'); return }
    if (!form.password)     { setError('Password is required.'); return }
    if (tab === 'signup' && !form.fullName.trim()) { setError('Full name is required.'); return }
    setLoading(true)
    const result = tab === 'signin'
      ? await onSignIn({ email: form.email.trim(), password: form.password })
      : await onSignUp({ email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), school: form.school.trim() })
    if (result?.error) {
      const msg = result.error.message || 'Something went wrong. Please try again.'
      if (tab === 'signin' && msg.toLowerCase().includes('email not confirmed')) {
        setConfirmNotice(true)
      } else {
        setError(msg)
      }
    } else if (tab === 'signup') {
      setSignedUp(true)
    }
    setLoading(false)
  }

  async function handleReset() {
    setError(''); setInfo(''); setConfirmNotice(false)
    if (!form.email.trim()) { setError('Enter your email address first.'); return }
    setLoading(true)
    const { error } = await onResetPassword(form.email.trim())
    setLoading(false)
    if (error) setError(error.message)
    else setInfo('Password reset link sent. Check your inbox.')
  }

  function switchTab(t) { setTab(t); setError(''); setInfo(''); setConfirmNotice(false); setSignedUp(false) }

  // ── Signup Confirmation Screen ──
  if (signedUp) {
    return (
      <div className="auth-bg">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-confirm-icon">
            <Mail size={36} color="#fff" strokeWidth={1.8} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 8, color: '#fff' }}>Check Your Email</h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            We sent a verification link to your email. Open your <strong style={{ color: '#d4a017' }}>Gmail</strong> or email inbox and click the confirmation link to activate your account.
          </p>
          <div className="auth-confirm-email">
            <Mail size={14} /> {form.email}
          </div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} onClick={() => { setSignedUp(false); switchTab('signin') }}>
              <ArrowLeft size={15} /> Back to Sign In
            </button>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #d4a017, #b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(212,160,23,.4)' }}>
            <Clock size={28} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 4, color: '#fff' }}>OJT Tracker</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>Internship Management System</p>
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
          <div style={{ marginTop: 16, display: 'flex', gap: 10, background: 'rgba(212,160,23,.1)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(212,160,23,.25)' }}>
            <Mail size={16} color="#d4a017" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#d4a017', marginBottom: 3 }}>Verify Your Email</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.55 }}>
                After signing up, open your <strong>Gmail</strong> or email inbox and click the confirmation link before signing in.
              </p>
            </div>
          </div>
        )}

        {/* Unconfirmed email notice */}
        {confirmNotice && (
          <div style={{ marginTop: 14, display: 'flex', gap: 10, background: 'rgba(255,149,0,.1)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,149,0,.25)' }}>
            <Mail size={16} color="#ff9500" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#ff9500', marginBottom: 3 }}>Email Not Verified</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.55 }}>
                Please confirm your account first. Check your <strong>Gmail</strong> inbox for the verification link we sent during signup.
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
          <button onClick={handleReset} style={{ marginTop: 12, background: 'none', border: 'none', color: '#d4a017', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'center', fontWeight: 500, padding: '4px' }}>
            Forgot password?
          </button>
        )}

        {onBackToLanding && (
          <button onClick={onBackToLanding} style={{ marginTop: 8, background: 'none', border: 'none', color: 'rgba(212,160,23,.7)', fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'center', fontWeight: 500, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <ArrowLeft size={13} /> Back to Home
          </button>
        )}
      </div>
    </div>
  )
}
