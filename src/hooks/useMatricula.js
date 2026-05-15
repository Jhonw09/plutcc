/**
 * useMatricula — gerencia matrícula de um aluno em uma trilha específica.
 * Toda persistência é via API (não localStorage).
 *
 * @param {number|string} trilhaId
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  matricular as apiMatricular,
  desmatricular as apiDesmatricular,
  verificarMatricula,
} from '../api/services/matriculaService'

export function useMatricula(trilhaId) {
  const { user } = useAuth()
  const alunoId = user?.id

  const [matriculado, setMatriculado] = useState(false)
  const [loadingCheck, setLoadingCheck] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  const [error, setError] = useState(null)

  // Verifica matrícula ao montar ou quando trilhaId/alunoId mudar
  useEffect(() => {
    if (!alunoId || !trilhaId) { setLoadingCheck(false); return }
    setLoadingCheck(true)
    verificarMatricula(alunoId, trilhaId)
      .then(setMatriculado)
      .catch(() => setMatriculado(false))
      .finally(() => setLoadingCheck(false))
  }, [alunoId, trilhaId])

  const matricular = useCallback(async () => {
    if (!alunoId || !trilhaId) return
    setLoadingAction(true)
    setError(null)
    try {
      await apiMatricular(alunoId, trilhaId)
      setMatriculado(true)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [alunoId, trilhaId])

  const desmatricular = useCallback(async () => {
    if (!alunoId || !trilhaId) return
    setLoadingAction(true)
    setError(null)
    try {
      await apiDesmatricular(alunoId, trilhaId)
      setMatriculado(false)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoadingAction(false)
    }
  }, [alunoId, trilhaId])

  return { matriculado, loadingCheck, loadingAction, error, matricular, desmatricular }
}
