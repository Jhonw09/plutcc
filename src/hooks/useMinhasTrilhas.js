import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMatriculasDoAluno } from '../api/services/matriculaService'
import { getTrilhasPublicas } from '../api/services/trilhaService'
import { getAulasByTrilha } from '../api/services/aulaService'
import { useTrilhasAluno } from './useTrilhasAluno'

export function useMinhasTrilhas() {
  const { user } = useAuth()
  const alunoId = user?.id
  const { concluidasSet } = useTrilhasAluno()

  const [minhasTrilhas,  setMinhasTrilhas]  = useState([])
  const [todasTrilhas,   setTodasTrilhas]   = useState([])
  // Map<trilhaId, aulaId[]> — aulas publicadas de cada trilha matriculada
  const [aulasMap,       setAulasMap]       = useState({})
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)

  const load = useCallback(async () => {
    if (!alunoId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [matriculas, todas] = await Promise.all([
        getMatriculasDoAluno(alunoId),
        getTrilhasPublicas(),
      ])
      const ids = new Set(matriculas.map(m => Number(m.trilhaId ?? m.id ?? m)))
      const minhas = todas.filter(t => ids.has(t.id))
      setTodasTrilhas(todas)
      setMinhasTrilhas(minhas)

      // Busca aulas de cada trilha matriculada para calcular progresso real
      const entries = await Promise.all(
        minhas.map(async t => {
          try {
            const aulas = await getAulasByTrilha(t.id)
            return [t.id, aulas.map(a => a.id)]
          } catch {
            return [t.id, []]
          }
        })
      )
      setAulasMap(Object.fromEntries(entries))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [alunoId])

  useEffect(() => { load() }, [load])

  // Progresso real: aulas concluídas / total de aulas da trilha
  const getProgresso = useCallback((trilhaId) => {
    const aulaIds = aulasMap[trilhaId]
    if (!aulaIds || aulaIds.length === 0) return 0
    const done = aulaIds.filter(id => concluidasSet.has(Number(id))).length
    return Math.round((done / aulaIds.length) * 100)
  }, [aulasMap, concluidasSet])

  return { minhasTrilhas, todasTrilhas, aulasMap, loading, error, reload: load, getProgresso }
}
