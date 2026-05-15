import { useState, useEffect, useCallback } from 'react'
import { getAlunosDaTrilha } from '../api/services/matriculaService'

/**
 * useMatriculasTrilha — lista alunos matriculados em uma trilha.
 * Usado na página de detalhe da trilha do professor.
 */
export function useMatriculasTrilha(trilhaId) {
  const [alunos,  setAlunos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    if (!trilhaId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getAlunosDaTrilha(trilhaId)
      setAlunos(data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [trilhaId])

  useEffect(() => { load() }, [load])

  return { alunos, loading, error, reload: load }
}
