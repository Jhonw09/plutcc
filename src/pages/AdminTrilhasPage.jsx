import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getAdminResumo } from '../api/services/adminService'
import styles from './AdminTrilhasPage.module.css'

const NIVEL_LABEL = { INICIANTE: 'Iniciante', INTERMEDIARIO: 'Intermediário', AVANCADO: 'Avançado' }

export default function AdminTrilhasPage() {
  const [trilhas,  setTrilhas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getAdminResumo()
      .then(r => setTrilhas(r.trilhas ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return trilhas
    const q = search.toLowerCase()
    return trilhas.filter(t =>
      t.nome?.toLowerCase().includes(q) ||
      t.professorNome?.toLowerCase().includes(q) ||
      t.disciplina?.toLowerCase().includes(q)
    )
  }, [trilhas, search])

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Trilhas</h1>
            <p className={styles.sub}>{trilhas.length} trilhas cadastradas</p>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <Icon name="search" size={15} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por nome, professor ou disciplina..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}><Icon name="alertCircle" size={13} /> {error}</p>}

        {loading ? (
          <div className={styles.loading}>Carregando trilhas...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Trilha</th>
                  <th>Professor</th>
                  <th>Disciplina</th>
                  <th>Nível</th>
                  <th>Alunos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>Nenhuma trilha encontrada.</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className={styles.trilhaNome}>{t.nome}</span>
                    </td>
                    <td className={styles.muted}>{t.professorNome ?? '—'}</td>
                    <td>
                      {t.disciplina
                        ? <span className={styles.disciplinaTag}>{t.disciplina}</span>
                        : <span className={styles.muted}>—</span>
                      }
                    </td>
                    <td className={styles.muted}>{NIVEL_LABEL[t.nivel] ?? t.nivel ?? '—'}</td>
                    <td>
                      <div className={styles.alunosCell}>
                        <Icon name="users" size={13} />
                        {t.totalAlunos}
                      </div>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.btnView}
                        onClick={() => navigate(`/admin/trilha/${t.id}`)}
                      >
                        Ver trilha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
