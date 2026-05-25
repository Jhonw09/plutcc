import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { concluirAula as apiConcluirAula, getAulasConcluidasAluno } from '../api/services/progressoService'

export function useTrilhasAluno() {
  const { user } = useAuth()
  const alunoId = user?.id ?? null

  // Set de aulaIds concluídas — fonte única de verdade
  const [concluidasSet, setConcluidasSet] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!alunoId) { setConcluidasSet(new Set()); loadedRef.current = false; return }
    if (loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    getAulasConcluidasAluno(alunoId)
      .then(ids => setConcluidasSet(new Set(ids.map(Number))))
      .finally(() => setLoading(false))
  }, [alunoId])

  const concluirAula = useCallback(async (_trilhaId, aulaId) => {
    if (!alunoId || !aulaId) return
    // Optimistic update
    setConcluidasSet(prev => new Set([...prev, Number(aulaId)]))
    try {
      await apiConcluirAula(alunoId, aulaId)
    } catch {
      // Reverte se falhar
      setConcluidasSet(prev => {
        const next = new Set(prev)
        next.delete(Number(aulaId))
        return next
      })
    }
  }, [alunoId])

  const getAulasConcluidas = useCallback((trilhaId) => {
    // trilhaId ignorado — filtragem por trilha é feita pelo chamador via lista de aulas
    return concluidasSet
  }, [concluidasSet])

  // Calcula progresso dado o array de aulas da trilha
  const getProgresso = useCallback((trilhaId, aulas) => {
    if (!aulas || aulas.length === 0) return 0
    const total = Array.isArray(aulas) ? aulas.length : aulas
    if (typeof aulas === 'number') {
      // fallback legado: não temos como calcular sem a lista real
      return 0
    }
    const done = aulas.filter(a => concluidasSet.has(Number(a.id))).length
    return Math.round((done / total) * 100)
  }, [concluidasSet])

  const getProgressoByIds = useCallback((aulaIds) => {
    if (!aulaIds || aulaIds.length === 0) return 0
    const done = aulaIds.filter(id => concluidasSet.has(Number(id))).length
    return Math.round((done / aulaIds.length) * 100)
  }, [concluidasSet])

  return { concluirAula, getAulasConcluidas, getProgresso, getProgressoByIds, concluidasSet, loading }
}
