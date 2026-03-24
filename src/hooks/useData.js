import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { calcHours } from '../utils/helpers'

/* ─── LOGS ─── */
export function useLogs(userId) {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) { setLogs([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('logs').select('*').eq('user_id', userId).order('date', { ascending: false })
    setLogs(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (!userId) return
    const ch = supabase.channel(`logs-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs', filter: `user_id=eq.${userId}` }, reload)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [userId, reload])

  function mapForm(f) {
    return {
      user_id: userId, date: f.date,
      time_in: f.time_in || null, time_out: f.time_out || null,
      break_minutes: Number(f.break_minutes) || 0,
      hours_worked: calcHours(f.time_in, f.time_out, f.break_minutes),
      description: f.description || '',
      tasks: Array.isArray(f.tasks) ? f.tasks : (f.tasks ? f.tasks.split(',').map(s => s.trim()).filter(Boolean) : []),
      mood: Number(f.mood) || 3,
    }
  }

  async function addLog(form) {
    const { data, error } = await supabase.from('logs').insert(mapForm(form)).select().single()
    if (!error && data) setLogs(p => [data, ...p])
    return { data, error }
  }
  async function updateLog(id, form) {
    const { data, error } = await supabase.from('logs').update(mapForm(form)).eq('id', id).select().single()
    if (!error && data) setLogs(p => p.map(l => l.id === id ? data : l))
    return { data, error }
  }
  async function deleteLog(id) {
    const { error } = await supabase.from('logs').delete().eq('id', id)
    if (!error) setLogs(p => p.filter(l => l.id !== id))
    return { error }
  }

  const totalHours = logs.reduce((s, l) => s + Number(l.hours_worked || 0), 0)
  return { logs, loading, addLog, updateLog, deleteLog, reload, totalHours }
}

/* ─── TASKS ─── */
export function useTasks(userId) {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) { setTasks([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    if (!userId) return
    const ch = supabase.channel(`tasks-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, reload)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [userId, reload])

  async function addTask(t) {
    const { data, error } = await supabase.from('tasks').insert({
      user_id: userId, title: t.title, description: t.description || '',
      priority: t.priority || 'normal', status: t.status || 'todo', due_date: t.due_date || null,
    }).select().single()
    if (!error && data) setTasks(p => [data, ...p])
    return { data, error }
  }
  async function updateTask(id, changes) {
    const { data, error } = await supabase.from('tasks').update(changes).eq('id', id).select().single()
    if (!error && data) setTasks(p => p.map(t => t.id === id ? data : t))
    return { data, error }
  }
  async function deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(p => p.filter(t => t.id !== id))
    return { error }
  }

  return { tasks, loading, addTask, updateTask, deleteTask, reload }
}

/* ─── NOTES ─── */
export function useNotes(userId) {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) { setNotes([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { reload() }, [reload])

  async function addNote(n) {
    const { data, error } = await supabase.from('notes').insert({
      user_id: userId, title: n.title || '', content: n.content, color: n.color || '#007aff',
    }).select().single()
    if (!error && data) setNotes(p => [data, ...p])
    return { data, error }
  }
  async function updateNote(id, changes) {
    const { data, error } = await supabase.from('notes').update(changes).eq('id', id).select().single()
    if (!error && data) setNotes(p => p.map(n => n.id === id ? data : n))
    return { data, error }
  }
  async function deleteNote(id) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) setNotes(p => p.filter(n => n.id !== id))
    return { error }
  }

  return { notes, loading, addNote, updateNote, deleteNote, reload }
}

/* ─── ANNOUNCEMENTS ─── */
export function useAnnouncements() {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [popupAnn, setPopupAnn] = useState(null)
  const seenRef     = useRef(new Set())
  const initialLoad = useRef(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
    if (initialLoad.current) {
      ;(data || []).forEach(a => seenRef.current.add(a.id))
      initialLoad.current = false
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    const ch = supabase.channel('announcements-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, async payload => {
        const { data } = await supabase.from('announcements').select('*').eq('id', payload.new.id).single()
        if (!data) return
        setItems(p => {
          if (p.some(a => a.id === data.id)) return p
          return [data, ...p]
        })
        if (!seenRef.current.has(data.id)) {
          seenRef.current.add(data.id)
          setPopupAnn(data)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, async payload => {
        const { data } = await supabase.from('announcements').select('*').eq('id', payload.new.id).single()
        if (data) setItems(p => p.map(a => a.id === data.id ? data : a))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'announcements' }, payload => {
        setItems(p => p.filter(a => a.id !== payload.old?.id))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function addAnnouncement({ title, content, priority, adminId, adminName }) {
    const { data, error } = await supabase.from('announcements').insert({
      title, content, priority, admin_id: adminId, admin_name: adminName,
    }).select().single()
    if (data) seenRef.current.add(data.id)
    return { data, error }
  }

  async function deleteAnnouncement(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (!error) setItems(p => p.filter(a => a.id !== id))
    return { error }
  }

  function dismissPopup() { setPopupAnn(null) }

  return { announcements: items, loading, addAnnouncement, deleteAnnouncement, reload, popupAnn, dismissPopup }
}
