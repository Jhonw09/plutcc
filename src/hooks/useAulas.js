import { useState, useEffect, useCallback } from 'react'
import {
  createAula as apiCreate,
  getAulasByTrilha,
  updateAula as apiUpdate,
  deleteAula as apiDelete,
} from '../api/services/aulaService'

export function useAulas(trilhaId) {
  const [aulas,   setAulas]   = useState([])
  const [loading, setLoading] = useState(true)  // true: evita flash de empty state antes do fetch
  const [error,   setError]   = useState(null)

  const loadAulas = useCallback(async () => {
    if (!trilhaId) return
    setLoading(true)
    setError(null)
    try {
      setAulas(await getAulasByTrilha(trilhaId))
    } catch (err) {
      // 404 = trilha nova sem aulas ainda, não é erro real
      if (err?.status === 404 || err?.message?.includes('404')) {
        setAulas([])
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [trilhaId])

  // Carrega aulas do backend no mount e sempre que trilhaId mudar (F5, link direto)
  useEffect(() => {
    loadAulas()
  }, [loadAulas])

  const createAula = useCallback(async (data) => {
    const nova = await apiCreate({ ...data, trilhaId })
    setAulas(prev => [...prev, nova])
    return nova
  }, [trilhaId])

  const updateAula = useCallback(async (id, data) => {
    const updated = await apiUpdate(id, data)
    setAulas(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }, [])

  const deleteAula = useCallback(async (id) => {
    await apiDelete(id)
    // Recarrega do backend para garantir sincronismo
    await loadAulas()
  }, [loadAulas])

  return { aulas, loading, error, createAula, updateAula, deleteAula, refreshAulas: loadAulas }
}
