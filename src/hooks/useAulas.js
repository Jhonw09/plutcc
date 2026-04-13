/**
 * Custom hook: useAulas
 *
 * Provides access to aula operations with loading and error state management.
 * Uses real backend API only (no localStorage fallback).
 *
 * Usage:
 *   const {
 *     aulas,
 *     loading,
 *     error,
 *     createAula,
 *     updateAula,
 *     deleteAula,
 *     refreshAulas
 *   } = useAulas(trilhaId)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getAulasByTrilha,
  createAula as apiCreateAula,
  updateAula as apiUpdateAula,
  deleteAula as apiDeleteAula
} from '../api/services/aulaService'

export function useAulas(trilhaId) {
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load aulas on mount and when trilhaId changes
  const loadAulas = useCallback(async () => {
    if (!trilhaId) {
      setAulas([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getAulasByTrilha(trilhaId)
      setAulas(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar aulas'
      setError(message)
      console.error('[useAulas] Load error:', err)
    } finally {
      setLoading(false)
    }
  }, [trilhaId])

  // Load aulas on mount
  useEffect(() => {
    loadAulas()
  }, [loadAulas])

  // Create aula function
  const createAulaHandler = useCallback(async (aulaData) => {
    try {
      setLoading(true)
      setError(null)

      const newAula = await apiCreateAula({ ...aulaData, trilhaId })

      // Add to local state immediately for better UX
      setAulas(prev => [...prev, newAula])

      return newAula
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar aula'
      setError(message)
      throw err // Re-throw so caller can handle
    } finally {
      setLoading(false)
    }
  }, [trilhaId])

  // Update aula function
  const updateAulaHandler = useCallback(async (aulaId, aulaData) => {
    try {
      setLoading(true)
      setError(null)

      const updatedAula = await apiUpdateAula(aulaId, aulaData)

      // Update local state
      setAulas(prev => prev.map(aula =>
        aula.id === aulaId ? updatedAula : aula
      ))

      return updatedAula
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar aula'
      setError(message)
      throw err // Re-throw so caller can handle
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete aula function
  const deleteAulaHandler = useCallback(async (aulaId) => {
    try {
      setLoading(true)
      setError(null)

      await apiDeleteAula(aulaId)

      // Remove from local state
      setAulas(prev => prev.filter(aula => aula.id !== aulaId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar aula'
      setError(message)
      throw err // Re-throw so caller can handle
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh aulas from API
  const refreshAulas = useCallback(async () => {
    await loadAulas()
  }, [loadAulas])

  return {
    aulas,
    loading,
    error,
    createAula: createAulaHandler,
    updateAula: updateAulaHandler,
    deleteAula: deleteAulaHandler,
    refreshAulas
  }
}