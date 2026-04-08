/**
 * Custom hook: useClass
 * 
 * Provides access to class service operations with loading and error state management.
 * 
 * ✅ MIGRATED OPERATIONS (API with localStorage fallback):
 *   - getClassesByUser()
 *   - getClassById()
 *   - joinClass()
 *   - leaveClass()
 *   - createClass()
 * 
 * 📦 NOT YET MIGRATED (Still using localStorage):
 *   - addMessageToMural()
 *   - addActivityToMural()
 *   - Comments and deletions
 * 
 * Usage:
 *   const { 
 *     joinClass, 
 *     leaveClass, 
 *     getClassesByUser, 
 *     getClassById,
 *     addMessageToMural,
 *     addActivityToMural,
 *     loading,  // true while any operation is in progress
 *     error     // error message if any operation failed
 *   } = useClass()
 */

import { useState, useCallback } from 'react'
import { classService } from '../api/services/classService'
import { useAuth } from '../context/AuthContext'

export function useClass() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const joinClass = useCallback(async (codigo) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.joinClass(user?.id, { codigo, userName: user?.name })
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id, user?.name])

  const leaveClass = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.leaveClass(user?.id, classId)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id])

  const getClassesByUser = useCallback(async (role) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.getClassesByUser(user?.id, role)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id])

  const getClassById = useCallback(async (classId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.getClassById(classId)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [])

  const addMessageToMural = useCallback(async (classId, texto) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.addMessageToMural(classId, user?.id, user?.name, texto)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id, user?.name])

  const addActivityToMural = useCallback(async (classId, activityData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.addActivityToMural(classId, user?.id, user?.name, activityData)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id, user?.name])

  const addCommentToPost = useCallback(async (classId, postId, texto) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.addCommentToPost(classId, postId, user?.id, user?.name, texto)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id, user?.name])

  const deleteCommentFromPost = useCallback(async (classId, postId, commentId) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.deleteCommentFromPost(classId, postId, commentId, user?.id)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id])

  const removeMember = useCallback(async (classId, memberIdToRemove) => {
    setLoading(true)
    setError(null)
    try {
      const result = await classService.removeMember(classId, memberIdToRemove, user?.id)
      setLoading(false)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setLoading(false)
      throw err
    }
  }, [user?.id])

  return {
    joinClass,
    leaveClass,
    getClassesByUser,
    getClassById,
    addMessageToMural,
    addActivityToMural,
    addCommentToPost,
    deleteCommentFromPost,
    removeMember,
    loading,
    error,
    clearError: () => setError(null),
  }
}
