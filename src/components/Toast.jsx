import { CheckCircle, AlertCircle, Info } from 'lucide-react'

export default function Toast({ msg, type = 'success' }) {
  if (!msg) return null
  const cfg = {
    success: { color: '#34c759', icon: <CheckCircle size={15} /> },
    error:   { color: '#ff3b30', icon: <AlertCircle  size={15} /> },
    info:    { color: '#007aff', icon: <Info          size={15} /> },
  }
  const { color, icon } = cfg[type] || cfg.success
  return (
    <div className="toast">
      <span style={{ color }}>{icon}</span>
      {msg}
    </div>
  )
}
