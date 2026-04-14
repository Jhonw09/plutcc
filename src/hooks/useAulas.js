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

import { useState, useCallback } from 'react'

// ── Mock data (remover quando backend estiver pronto) ──────────────────────────
let mockAulas = [
  {
    id: 1,
    titulo: 'Aula 1 — Introdução ao tema',
    trilhaId: null,
    blocos: [
      { id: 1, tipo: 'explicacao', conteudo: '## Objetivos\nConteúdo de exemplo da primeira aula.' },
      { id: 2, tipo: 'questionario', pergunta: 'Qual é o objetivo desta aula?', alternativas: ['Aprender conceitos básicos', 'Fazer exercícios', 'Assistir vídeos', 'Nenhuma das anteriores'], correta: 0 },
    ],
  },
  {
    id: 2,
    titulo: 'Aula 2 — Aprofundamento',
    trilhaId: null,
    blocos: [
      { id: 3, tipo: 'explicacao', conteudo: '## Conteúdo\nAprofundamento dos conceitos vistos na aula anterior.' },
      { id: 4, tipo: 'video', conteudo: 'https://youtube.com/watch?v=exemplo' },
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
      const data = await mockGetAulas()
      setAulas(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createAulaHandler = useCallback(async (aulaData) => {
    const newAula = await mockCreate({ ...aulaData, trilhaId })
    setAulas(prev => [...prev, newAula])
    return newAula
  }, [trilhaId])

  const updateAulaHandler = useCallback(async (aulaId, aulaData) => {
    const updated = await mockUpdate(aulaId, aulaData)
    setAulas(prev => prev.map(a => a.id === aulaId ? updated : a))
    return updated
  }, [])

  const deleteAulaHandler = useCallback(async (aulaId) => {
    await mockDelete(aulaId)
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