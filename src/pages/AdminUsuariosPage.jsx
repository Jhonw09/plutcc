import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../components/admin/AdminLayout'
import Icon from '../components/ui/Icon'
import { getUsuarios, toggleAtivo } from '../api/services/adminService'
import styles from './AdminUsuariosPage.module.css'

const ROLE_LABEL  = { ADMIN: 'Admin', PROFESSOR: 'Professor', ALUNO: 'Aluno' }
const ROLE_FILTER = ['Todos', 'ALUNO', 'PROFESSOR', 'ADMIN']

export default function AdminUsuariosPage() {
  const [usuarios,   setUsuarios]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [togglingId, setTogglingId] = useState(null)

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

  async function handleToggle(usuario) {
    if (usuario.tipoUsuario === 'ADMIN') return
    setTogglingId(usuario.id)
    setError('')
    try {
      const updated = await toggleAtivo(usuario)
      setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch (e) {
      setError(e.message)
    } finally {
      setTogglingId(null)
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
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>Nenhum usuário encontrado.</td></tr>
                ) : filtered.map(u => {
                  const isAdmin    = u.tipoUsuario === 'ADMIN'
                  const isToggling = togglingId === u.id
                  return (
                    <tr key={u.id} className={!u.ativo ? styles.rowInativo : ''}>
                      <td>
                        <div className={styles.userCell}>
                          <span className={`${styles.avatar} ${!u.ativo ? styles.avatarInativo : ''}`}>
                            {u.nome?.charAt(0).toUpperCase()}
                          </span>
                          <span className={styles.userName}>{u.nome}</span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{u.email}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[u.tipoUsuario?.toLowerCase()]}`}>
                          {ROLE_LABEL[u.tipoUsuario] ?? u.tipoUsuario}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${u.ativo ? styles.statusAtivo : styles.statusInativo}`}>
                          {u.ativo ? 'Ativo' : 'Suspenso'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        {isAdmin ? (
                          <span className={styles.protectedText}>—</span>
                        ) : (
                          <button
                            className={`${styles.toggleBtn} ${u.ativo ? styles.toggleBtnAtivo : styles.toggleBtnInativo}`}
                            onClick={() => handleToggle(u)}
                            disabled={isToggling}
                            title={u.ativo ? 'Suspender usuário' : 'Reativar usuário'}
                          >
                            {isToggling ? (
                              <span className={styles.spinner} />
                            ) : u.ativo ? (
                              <><Icon name="lock" size={13} /> Suspender</>
                            ) : (
                              <><Icon name="unlock" size={13} /> Reativar</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
