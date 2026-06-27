import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getUsuarios, deleteUsuario } from '../api/services/adminService'
import styles from './AdminUsuariosPage.module.css'

const ROLE_LABEL = { ADMIN: 'Admin', PROFESSOR: 'Professor', ALUNO: 'Aluno' }
const ROLE_FILTER = ['Todos', 'ALUNO', 'PROFESSOR', 'ADMIN']

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId,  setConfirmId]  = useState(null)

  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return usuarios.filter(u => {
      const matchRole   = roleFilter === 'Todos' || u.tipoUsuario === roleFilter
      const matchSearch = !search.trim() ||
        u.nome?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      return matchRole && matchSearch
    })
  }, [usuarios, search, roleFilter])

  async function handleDelete(id) {
    setDeletingId(id)
    try {
      await deleteUsuario(id)
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>Usuários</h1>
            <p className={styles.sub}>{usuarios.length} usuários cadastrados</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Icon name="search" size={15} />
            <input
              className={styles.searchInput}
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            {ROLE_FILTER.map(r => (
              <button
                key={r}
                className={`${styles.filterBtn} ${roleFilter === r ? styles.filterActive : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'Todos' ? 'Todos' : ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}><Icon name="alertCircle" size={13} /> {error}</p>}

        {loading ? (
          <div className={styles.loading}>Carregando usuários...</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className={styles.empty}>Nenhum usuário encontrado.</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.avatar}>{u.nome?.charAt(0).toUpperCase()}</span>
                        <span className={styles.userName}>{u.nome}</span>
                      </div>
                    </td>
                    <td className={styles.emailCell}>{u.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[u.tipoUsuario?.toLowerCase()]}`}>
                        {ROLE_LABEL[u.tipoUsuario] ?? u.tipoUsuario}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      {confirmId === u.id ? (
                        <div className={styles.confirmRow}>
                          <span className={styles.confirmText}>Confirmar exclusão?</span>
                          <button
                            className={styles.btnDanger}
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                          >
                            {deletingId === u.id ? '...' : 'Excluir'}
                          </button>
                          <button className={styles.btnCancel} onClick={() => setConfirmId(null)}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.btnDelete}
                          onClick={() => setConfirmId(u.id)}
                          aria-label="Excluir usuário"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      )}
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
