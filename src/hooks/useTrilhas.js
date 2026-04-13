/**
 * Custom hook: useTrilhas
 *
 * Provides access to trilha operations with loading and error state management.
 * Uses real backend API only (no localStorage fallback).
 *
 * Usage:
 *   const {
 *     trilhas,
 *     loading,
 *     error,
 *     createTrilha,
 *     refreshTrilhas
 *   } = useTrilhas()
 */

import { useState, useEffect, useCallback } from 'react'
import { getMyTrilhas, createTrilha as apiCreateTrilha, deleteTrilha as apiDeleteTrilha } from '../api/services/trilhaService'
import { useAuth } from '../context/AuthContext'

export function useTrilhas() {
  const { user } = useAuth()
  const [trilhas, setTrilhas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load trilhas on mount and when user changes
  const loadTrilhas = useCallback(async () => {
    if (!user?.id) {
      setTrilhas([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getMyTrilhas(user.id)
      setTrilhas(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar trilhas'
      setError(message)
      console.error('[useTrilhas] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load trilhas on mount
  useEffect(() => {
    loadTrilhas()
  }, [loadTrilhas])

  // Create trilha function
  const createTrilhaHandler = useCallback(async (trilhaData) => {
    try {
      setLoading(true)
      setError(null)

      const newTrilha = await apiCreateTrilha(trilhaData)

      // Add to local state immediately for better UX
      setTrilhas(prev => [newTrilha, ...prev])

      return newTrilha
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar trilha'
      setError(message)
      throw err // Re-throw so caller can handle
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete trilha function
  const deleteTrilhaHandler = useCallback(async (id) => {
    await apiDeleteTrilha(id, user?.id)
    setTrilhas(prev => prev.filter(t => t.id !== id))
  }, [user?.id])

  // Refresh trilhas from API
  const refreshTrilhas = useCallback(async () => {
    await loadTrilhas()
  }, [loadTrilhas])

  return {
    trilhas,
    loading,
    error,
    createTrilha: createTrilhaHandler,
    deleteTrilha: deleteTrilhaHandler,
    refreshTrilhas
  }
}