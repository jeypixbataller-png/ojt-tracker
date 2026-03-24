import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useGoals(userId) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) { setGoals([]); setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { reload() }, [reload])

  async function addGoal(g) {
    const { data, error } = await supabase.from('goals').insert({
      user_id: userId, title: g.title, target: Number(g.target) || 0,
      current: Number(g.current) || 0, unit: g.unit || 'hours', deadline: g.deadline || null,
    }).select().single()
    if (!error && data) setGoals(p => [data, ...p])
    return { data, error }
  }

  async function updateGoal(id, changes) {
    const { data, error } = await supabase.from('goals').update(changes).eq('id', id).select().single()
    if (!error && data) setGoals(p => p.map(g => g.id === id ? data : g))
    return { data, error }
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (!error) setGoals(p => p.filter(g => g.id !== id))
    return { error }
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal, reload }
}
