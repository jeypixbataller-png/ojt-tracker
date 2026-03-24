import { useRef } from 'react'
import { Download, Award } from 'lucide-react'
import { format } from 'date-fns'
import { fmtH } from '../utils/helpers'

export default function CertificatePage({ profile, totalHours }) {
  const certRef = useRef(null)
  const req = profile?.required_hours || 500
  const pct = Math.min(100, (totalHours / req) * 100)
  const complete = pct >= 100

  function downloadCert() {
    const el = certRef.current
    if (!el) return
    const printWin = window.open('', '_blank')
    printWin.document.write(`
      <html><head><title>OJT Certificate</title>
      <style>
        body { margin: 0; padding: 40px; font-family: Georgia, serif; }
        .cert { border: 4px double #1a365d; padding: 60px 50px; text-align: center; max-width: 800px; margin: auto; position: relative; }
        .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #1a365d; pointer-events: none; }
        h1 { font-size: 36px; color: #1a365d; margin: 0 0 8px; letter-spacing: 2px; }
        h2 { font-size: 20px; color: #4a5568; font-weight: 400; margin: 0 0 30px; }
        .name { font-size: 32px; font-weight: bold; color: #1a365d; border-bottom: 2px solid #1a365d; display: inline-block; padding: 0 20px 4px; margin: 10px 0 20px; }
        .details { font-size: 16px; color: #4a5568; line-height: 1.8; }
        .date { margin-top: 40px; font-size: 14px; color: #718096; }
        @media print { body { padding: 0; } }
      </style></head>
      <body>
        <div class="cert">
          <h1>CERTIFICATE OF COMPLETION</h1>
          <h2>On-the-Job Training Program</h2>
          <p style="color:#718096;font-size:14px;">This certifies that</p>
          <div class="name">${profile?.full_name || 'Student'}</div>
          <div class="details">
            <p>has successfully completed <strong>${fmtH(totalHours)}</strong> of on-the-job training</p>
            <p>at <strong>${profile?.company || 'the host company'}</strong></p>
            ${profile?.school ? `<p>from <strong>${profile.school}</strong></p>` : ''}
          </div>
          <div class="date">
            <p>Date of Completion: ${format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <script>window.print()</script>
      </body></html>
    `)
    printWin.document.close()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate</h1>
          <p className="page-sub">Generate your OJT completion certificate</p>
        </div>
        {complete && (
          <button className="btn btn-primary" onClick={downloadCert}>
            <Download size={14} /> Print Certificate
          </button>
        )}
      </div>

      {!complete ? (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Award size={28} style={{ color: 'var(--warning)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Not Yet Complete</h3>
          <p style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            You've completed {Math.round(pct)}% of your required hours. Keep going! You need {fmtH(Math.max(0, req - totalHours))} more to generate your certificate.
          </p>
          <div className="prog-track" style={{ maxWidth: 300, margin: '20px auto 0' }}>
            <div className="prog-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <div ref={certRef} className="card" style={{ padding: '50px 40px', textAlign: 'center', border: '3px double var(--primary)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 10, border: '1px solid var(--border)', borderRadius: 'var(--r)', pointerEvents: 'none' }} />
          <Award size={40} style={{ color: 'var(--primary)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, color: 'var(--primary)', letterSpacing: '.1em', marginBottom: 4 }}>CERTIFICATE OF COMPLETION</h2>
          <p style={{ color: 'var(--text3)', fontSize: 16, marginBottom: 24 }}>On-the-Job Training Program</p>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 4 }}>This certifies that</p>
          <h1 style={{ fontSize: 'clamp(24px,5vw,36px)', fontWeight: 700, borderBottom: '2px solid var(--primary)', display: 'inline-block', padding: '0 20px 4px', marginBottom: 20 }}>
            {profile?.full_name || 'Student'}
          </h1>
          <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 2 }}>
            <p>has successfully completed <b style={{ color: 'var(--primary)' }}>{fmtH(totalHours)}</b> of on-the-job training</p>
            {profile?.company && <p>at <b>{profile.company}</b></p>}
            {profile?.school && <p>from <b>{profile.school}</b></p>}
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 30 }}>
            Date of Completion: {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  )
}
