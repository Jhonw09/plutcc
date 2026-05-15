/**
 * useTrilhasAluno — gerencia trilhas iniciadas pelo aluno.
 * Persiste em localStorage. Arquitetura pronta para trocar por API real.
 *
 * Formato no localStorage: { [userId]: { [trilhaId]: { iniciadaEm, aulasConcluidas: [] } } }
 *
 * Para migrar para backend: substituir as funções read/write por chamadas à API
 * nos endpoints sugeridos abaixo:
 *   POST   /api/v1/progresso          { alunoId, trilhaId }
 *   GET    /api/v1/progresso?alunoId= → lista de trilhas iniciadas com progresso
 *   PATCH  /api/v1/progresso/:id/aula { aulaId }  → marca aula concluída
 */

import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const KEY = 'sc_trilhas_aluno'

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function useTrilhasAluno() {
  const { user } = useAuth()
  const uid = String(user?.id ?? 'guest')

  const [, forceUpdate] = useState(0)
  const rerender = () => forceUpdate(n => n + 1)

  function getUserData() {
    return readAll()[uid] ?? {}
  }

  const trilhasIniciadas = getUserData()

  const iniciarTrilha = useCallback((trilhaId) => {
    const all = readAll()
    if (!all[uid]) all[uid] = {}
    if (!all[uid][trilhaId]) {
      all[uid][trilhaId] = { iniciadaEm: new Date().toISOString(), aulasConcluidas: [] }
      writeAll(all)
      rerender()
    }
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const concluirAula = useCallback((trilhaId, aulaId) => {
    const all = readAll()
    if (!all[uid]?.[trilhaId]) return
    const ids = all[uid][trilhaId].aulasConcluidas
    if (!ids.includes(aulaId)) {
      all[uid][trilhaId].aulasConcluidas = [...ids, aulaId]
      writeAll(all)
      rerender()
    }
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const getProgresso = useCallback((trilhaId, totalAulas) => {
    const dados = getUserData()[trilhaId]
    if (!dados || totalAulas === 0) return 0
    return Math.round((dados.aulasConcluidas.length / totalAulas) * 100)
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const getAulasConcluidas = useCallback((trilhaId) => {
    return new Set(getUserData()[trilhaId]?.aulasConcluidas ?? [])
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  const foiIniciada = useCallback((trilhaId) => {
    return !!getUserData()[trilhaId]
  }, [uid]) // eslint-disable-line react-hooks/exhaustive-deps

  return { trilhasIniciadas, iniciarTrilha, concluirAula, getProgresso, getAulasConcluidas, foiIniciada }
}
