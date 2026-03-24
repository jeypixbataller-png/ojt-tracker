import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { FileText, Upload, Trash2, Download, X, FolderOpen, File, Image, FileSpreadsheet } from 'lucide-react'
import { format } from 'date-fns'

const BUCKET = 'documents'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED = ['pdf','doc','docx','xls','xlsx','ppt','pptx','txt','jpg','jpeg','png','gif','webp','csv']

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return <Image size={18} />
  if (['xls','xlsx','csv'].includes(ext)) return <FileSpreadsheet size={18} />
  return <File size={18} />
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function DocumentsPage({ userId }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const folder = `${userId}/`

  async function loadFiles() {
    setLoading(true)
    const { data, error } = await supabase.storage.from(BUCKET).list(userId, { sortBy: { column: 'created_at', order: 'desc' } })
    if (error) { setError('Could not load files. Make sure the "documents" storage bucket exists in Supabase.'); setLoading(false); return }
    setFiles((data || []).filter(f => f.name !== '.emptyFolderPlaceholder'))
    setLoading(false)
  }

  useEffect(() => { if (userId) loadFiles() }, [userId])

  async function handleUpload(e) {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    setError('')
    setUploading(true)

    for (const file of selected) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!ALLOWED.includes(ext)) { setError(`"${file.name}" has unsupported file type.`); continue }
      if (file.size > MAX_SIZE) { setError(`"${file.name}" exceeds 10 MB limit.`); continue }
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(`${folder}${safeName}`, file)
      if (upErr) setError(upErr.message)
    }

    inputRef.current.value = ''
    setUploading(false)
    loadFiles()
  }

  async function handleDelete(name) {
    const { error } = await supabase.storage.from(BUCKET).remove([`${folder}${name}`])
    if (error) { setError(error.message); return }
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  function handleDownload(name) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${folder}${name}`)
    if (data?.publicUrl) window.open(data.publicUrl, '_blank', 'noopener')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-sub">Upload and manage your OJT documents</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={inputRef} type="file" multiple accept={ALLOWED.map(e => `.${e}`).join(',')} style={{ display: 'none' }} onChange={handleUpload} />
          <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <><span className="spin" /> Uploading...</> : <><Upload size={15} /> Upload</>}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          {error}
          <button className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Supported: {ALLOWED.join(', ')}</span>
        <span>Max size: 10 MB</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 50, gap: 10, color: 'var(--text3)' }}><span className="spin spin-dark" /> Loading...</div>
      ) : files.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--text4)' }}>
            <FolderOpen size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No documents yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>Upload your completion forms, reports, or certificates</p>
          <button className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()}>
            <Upload size={14} /> Upload Files
          </button>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>File Name</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th style={{ width: 100, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id || f.name}>
                  <td style={{ color: 'var(--primary)' }}>{fileIcon(f.name)}</td>
                  <td style={{ fontWeight: 500, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name.replace(/^\d+_/, '')}
                  </td>
                  <td style={{ color: 'var(--text3)' }}>{fmtSize(f.metadata?.size || 0)}</td>
                  <td style={{ color: 'var(--text3)', fontSize: 12 }}>
                    {f.created_at ? format(new Date(f.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Download" onClick={() => handleDownload(f.name)}>
                        <Download size={14} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => handleDelete(f.name)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
