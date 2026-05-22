/**
 * useMinhasTrilhas — retorna trilhas em que o aluno está matriculado
 * e todas as trilhas públicas em uma única chamada ao hook.
 *
 * Expõe todasTrilhas para que os componentes consumidores (DashboardPage,
 * MinhasTrilhasPage) não precisem fazer um segundo fetch de getTrilhasPublicas.
 * Isso elimina requests duplicados para GET /trilhas.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMatriculasDoAluno } from '../api/services/matriculaService'
import { getTrilhasPublicas } from '../api/services/trilhaService'

export function useMinhasTrilhas() {
  const { user } = useAuth()
  const alunoId = user?.id

  const [minhasTrilhas, setMinhasTrilhas] = useState([])
  const [todasTrilhas,  setTodasTrilhas]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    if (!alunoId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [matriculas, todas] = await Promise.all([
        getMatriculasDoAluno(alunoId),
        getTrilhasPublicas(),
      ])
      const ids = new Set(
        matriculas.map(m => Number(m.trilhaId ?? m.id ?? m))
      )
      setTodasTrilhas(todas)
      setMinhasTrilhas(todas.filter(t => ids.has(t.id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [alunoId])

  useEffect(() => { load() }, [load])

  return { minhasTrilhas, todasTrilhas, loading, error, reload: load }
}
