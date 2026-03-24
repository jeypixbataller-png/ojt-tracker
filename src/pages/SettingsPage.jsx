import { useState } from 'react'
import { Save, Download, Check, User, Building, Calendar, Globe } from 'lucide-react'
import { toCSV, fmtH } from '../utils/helpers'
import { useI18n } from '../utils/i18n'

export default function SettingsPage({ profile, updateProfile, logs }) {
  const { lang, setLang, t, LANGS } = useI18n()
  const [form, setForm] = useState({
    full_name:       profile?.full_name       || '',
    school:          profile?.school          || '',
    required_hours:  profile?.required_hours  || 500,
    company_name:    profile?.company_name    || '',
    supervisor_name: profile?.supervisor_name || '',
    department:      profile?.department      || '',
    start_date:      profile?.start_date      || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function save() {
    setSaving(true); setError(''); setSaved(false)
    // Convert empty start_date to null
    const formToSave = {
      ...form,
      start_date: form.start_date === '' ? null : form.start_date,
    }
    const { error } = await updateProfile(formToSave)
    setSaving(false)
    if (error) { setError(error.message || 'Failed to save'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const total = logs.reduce((s, l) => s + Number(l.hours_worked || 0), 0)

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your profile and OJT information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <Section title="Personal" icon={<User size={15} />}>
          <div className="field">
            <label>Full Name</label>
            <input className="inp" value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
          </div>
          <div className="field">
            <label>School / University</label>
            <input className="inp" value={form.school} onChange={set('school')} placeholder="e.g. MSU-IIT, DLSU, PUP" />
          </div>
          <div className="field">
            <label>Required OJT Hours</label>
            <input type="number" className="inp" value={form.required_hours} min={1} max={9999} onChange={set('required_hours')} />
          </div>
          <div className="field">
            <label>Start Date</label>
            <input type="date" className="inp" value={form.start_date} onChange={set('start_date')} />
          </div>
        </Section>

        <Section title="Company" icon={<Building size={15} />}>
          <div className="field">
            <label>Company Name</label>
            <input className="inp" value={form.company_name} onChange={set('company_name')} placeholder="Where you are interning" />
          </div>
          <div className="field">
            <label>Department</label>
            <input className="inp" value={form.department} onChange={set('department')} placeholder="e.g. Engineering, IT, HR" />
          </div>
          <div className="field">
            <label>Supervisor Name</label>
            <input className="inp" value={form.supervisor_name} onChange={set('supervisor_name')} placeholder="Your supervisor's name" />
          </div>
        </Section>

        <Section title="Export Data" icon={<Download size={15} />}>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            Export all your time logs as a CSV file for school submission or personal records.
          </div>
          <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '10px 13px', fontSize: 13, color: 'var(--text2)', border: '1px solid var(--border)' }}>
            {logs.length} entries · {fmtH(total)} total logged
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => toCSV(logs, form.full_name || 'ojt')}>
            <Download size={14} /> Download CSV
          </button>
        </Section>

        <Section title={t('language')} icon={<Globe size={15} />}>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
            Choose your preferred language for the interface.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {LANGS.map(l => (
              <button key={l.code} className={`btn ${lang === l.code ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                onClick={() => setLang(l.code)}>
                {lang === l.code && <Check size={13} />} {l.label}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(255,59,48,.15)', color: 'var(--danger)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{error}</div>
      )}

      <div>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: '11px 28px' }}>
          {saving ? <><span className="spin" /> Saving...</>
           : saved  ? <><Check size={15} /> Saved</>
           : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', paddingBottom: 12, borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}
