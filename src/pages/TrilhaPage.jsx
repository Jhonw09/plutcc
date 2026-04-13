import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useAulas } from '../hooks/useAulas'

export default function TrilhaPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { aulas, loading, error } = useAulas(id)

  const [trilha, setTrilha] = useState(null)
  const [trilhaLoading, setTrilhaLoading] = useState(true)

  // Fetch trilha data
  useEffect(() => {
    async function loadTrilha() {
      try {
        // For now, mock trilha data since we don't have the service
        setTrilha({
          id: parseInt(id),
          nome: 'Trilha de Matemática Básica',
          descricao: 'Aprenda os fundamentos da matemática',
          tipo: 'PUBLICA',
          nivel: 'Básico',
          professorNome: 'Professor Silva',
          disciplina: 'Matemática'
        })
      } catch (err) {
        console.error('Erro ao carregar trilha:', err)
      } finally {
        setTrilhaLoading(false)
      }
    }
    loadTrilha()
  }, [id])

  if (trilhaLoading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Carregando trilha...
        </div>
      </AppLayout>
    )
  }

  if (!trilha) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Trilha não encontrada
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1>{trilha.nome}</h1>
          <p>{trilha.descricao}</p>
          <p>Professor: {trilha.professorNome}</p>
        </div>

        <h2>Aulas</h2>
        {loading && <p>Carregando aulas...</p>}
        {error && <p>Erro: {error}</p>}
        {!loading && !error && aulas.length === 0 && <p>Nenhuma aula disponível</p>}
        {!loading && !error && aulas.length > 0 && (
          <div>
            {aulas.map(aula => (
              <div key={aula.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>{aula.titulo}</h3>
                <p>Tipo: {aula.tipo}</p>
                <div>{aula.conteudo}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}