/**
 * useMinhasTrilhas — retorna trilhas em que o aluno está matriculado.
 * Busca matrículas da API e faz join com dados completos das trilhas.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMatriculasDoAluno } from '../api/services/matriculaService'
import { getTrilhasPublicas } from '../api/services/trilhaService'

export function useMinhasTrilhas() {
  const { user } = useAuth()
  const alunoId = user?.id

  const [minhasTrilhas, setMinhasTrilhas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    if (!alunoId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [matriculas, todasTrilhas] = await Promise.all([
        getMatriculasDoAluno(alunoId),
        getTrilhasPublicas(),
      ])
      // matriculas pode ser array de objetos { trilhaId, ... } ou array de trilhas completas
      const ids = new Set(
        matriculas.map(m => Number(m.trilhaId ?? m.id ?? m))
      )
      setMinhasTrilhas(todasTrilhas.filter(t => ids.has(t.id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [alunoId])

  useEffect(() => { load() }, [load])

  return { minhasTrilhas, loading, error, reload: load }
}
