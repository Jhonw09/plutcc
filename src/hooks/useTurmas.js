/**
 * Custom hook: useTurmas
 *
 * Provides access to turma operations with loading and error state management.
 * Uses real backend API only (no localStorage fallback).
 *
 * Usage:
 *   const {
 *     turmas,
 *     loading,
 *     error,
 *     createTurma,
 *     refreshTurmas
 *   } = useTurmas()
 */

import { useState, useEffect, useCallback } from 'react'
import { getMyTurmas, createTurma as apiCreateTurma } from '../api/services/turmaService'
import { useAuth } from '../context/AuthContext'

export function useTurmas() {
  const { user } = useAuth()
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load turmas on mount and when user changes
  const loadTurmas = useCallback(async () => {
    if (!user?.id) {
      setTurmas([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getMyTurmas(user.id)
      setTurmas(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar turmas'
      setError(message)
      console.error('[useTurmas] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load turmas on mount
  useEffect(() => {
    loadTurmas()
  }, [loadTurmas])

  // Create turma function
  const createTurmaHandler = useCallback(async (turmaData) => {
    try {
      setLoading(true)
      setError(null)

      const newTurma = await apiCreateTurma(turmaData)

      // Add to local state immediately for better UX
      setTurmas(prev => [newTurma, ...prev])

      return newTurma
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar turma'
      setError(message)
      throw err // Re-throw so caller can handle
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh turmas from API
  const refreshTurmas = useCallback(async () => {
    await loadTurmas()
  }, [loadTurmas])

  return {
    turmas,
    loading,
    error,
    createTurma: createTurmaHandler,
    refreshTurmas
  }
}