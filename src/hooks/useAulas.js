import { useState, useCallback } from 'react'
import {
  createAula as apiCreate,
  getAulasByTrilha,
  updateAula as apiUpdate,
  deleteAula as apiDelete,
} from '../api/services/aulaService'

const USE_API = import.meta.env.VITE_USE_API === 'true'

// ── Mock data (ativo quando VITE_USE_API=false) ───────────────────────────────
let mockAulas = [
  {
    id: 1,
    titulo: 'Aula 1 — Introdução ao tema',
    trilhaId: null,
    blocos: [
      { id: 1, ordem: 1, tipo: 'explicacao', conteudo: '## Objetivos\nConteúdo de exemplo da primeira aula.' },
      { id: 2, ordem: 2, tipo: 'questionario', pergunta: 'Qual é o objetivo desta aula?', alternativas: ['Aprender conceitos básicos', 'Fazer exercícios', 'Assistir vídeos', 'Nenhuma das anteriores'], correta: 0 },
    ],
  },
  {
    id: 2,
    titulo: 'Aula 2 — Aprofundamento',
    trilhaId: null,
    blocos: [
      { id: 3, ordem: 1, tipo: 'explicacao', conteudo: '## Conteúdo\nAprofundamento dos conceitos vistos na aula anterior.' },
      { id: 4, ordem: 2, tipo: 'video', conteudo: 'https://youtube.com/watch?v=exemplo' },
    ],
  },
]
let nextId = 3

async function mockGetAulas() { return [...mockAulas] }
async function mockCreate(data) {
  const aula = { ...data, id: nextId++ }
  mockAulas = [...mockAulas, aula]
  return aula
}
async function mockUpdate(id, data) {
  mockAulas = mockAulas.map(a => a.id === id ? { ...a, ...data } : a)
  return mockAulas.find(a => a.id === id)
}
async function mockDelete(id) {
  mockAulas = mockAulas.filter(a => a.id !== id)
}

export function useAulas(trilhaId) {
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAulas = useCallback(async () => {
    setLoading(true)
    try {
      const data = USE_API
        ? await getAulasByTrilha(trilhaId)
        : await mockGetAulas()
      setAulas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [trilhaId])

  const createAulaHandler = useCallback(async (aulaData) => {
    const newAula = USE_API
      ? await apiCreate({ ...aulaData, trilhaId })
      : await mockCreate({ ...aulaData, trilhaId })
    setAulas(prev => [...prev, newAula])
    return newAula
  }, [trilhaId])

  const updateAulaHandler = useCallback(async (aulaId, aulaData) => {
    const updated = USE_API
      ? await apiUpdate(aulaId, aulaData)
      : await mockUpdate(aulaId, aulaData)
    setAulas(prev => prev.map(a => a.id === aulaId ? updated : a))
    return updated
  }, [])

  const deleteAulaHandler = useCallback(async (aulaId) => {
    USE_API ? await apiDelete(aulaId) : await mockDelete(aulaId)
    setAulas(prev => prev.filter(a => a.id !== aulaId))
  }, [])

  return {
    aulas,
    loading,
    error,
    createAula: createAulaHandler,
    updateAula: updateAulaHandler,
    deleteAula: deleteAulaHandler,
    refreshAulas: loadAulas,
  }
}
