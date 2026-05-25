import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPerfil, createPerfil, updatePerfil } from '../api/services/perfilService'

export function usePerfilAprendizado() {
  const { user } = useAuth()
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    getPerfil(user.id)
      .then(setPerfil)
      .finally(() => setLoading(false))
  }, [user?.id])

  const savePerfil = useCallback(async (data) => {
    const payload = { ...data, alunoId: user.id }
    const saved = perfil
      ? await updatePerfil(user.id, payload)
      : await createPerfil(payload)
    setPerfil(saved)
    return saved
  }, [user?.id, perfil])

  // Helpers derivados
  const metaSemanal   = perfil?.metaSemanal ?? 5
  const interesses    = perfil?.interesses
    ? perfil.interesses.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const dificuldades  = perfil?.dificuldades
    ? perfil.dificuldades.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return { perfil, loading, savePerfil, metaSemanal, interesses, dificuldades }
}
