import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './ProfileDropdown.module.css'

const ROLE_LABELS = { student: 'Aluno', teacher: 'Professor', admin: 'Admin' }

export default function ProfileDropdown() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ name: '', email: '' })
  const [error, setError]     = useState('')
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openDropdown() {
    setForm({ name: user?.name ?? '', email: user?.email ?? '' })
    setEditing(false)
    setError('')
    setOpen(o => !o)
  }

  function handleSave() {
    if (!form.name.trim())  { setError('Nome não pode ser vazio.'); return }
    if (!form.email.trim()) { setError('E-mail não pode ser vazio.'); return }
    updateUser({ name: form.name.trim(), email: form.email.trim() })
    setEditing(false)
    setError('')
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase()

  return (
    <div className={styles.wrap} ref={ref}>
      {/* Avatar trigger */}
      <button
        className={`${styles.avatar} ${open ? styles.avatarActive : ''}`}
        onClick={openDropdown}
        aria-label="Perfil"
        aria-expanded={open}
      >
        {initials}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Perfil do usuário">

          {!editing ? (
            /* ── View mode ── */
            <>
              <div className={styles.profileTop}>
                <div className={styles.bigAvatar}>{initials}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{user?.name}</span>
                  <span className={styles.profileEmail}>{user?.email ?? '—'}</span>
                  <span className={styles.roleBadge}>
                    {ROLE_LABELS[user?.role] ?? user?.role}
                  </span>
                </div>
              </div>

              <div className={styles.divider} />

              <button className={styles.actionBtn} onClick={() => setEditing(true)}>
                ✏️ Editar perfil
              </button>

              <div className={styles.divider} />

              <button className={styles.logoutBtn} onClick={handleLogout}>
                🚪 Sair da conta
              </button>
            </>
          ) : (
            /* ── Edit mode ── */
            <>
              <p className={styles.editTitle}>Editar perfil</p>

              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input
                  className={styles.input}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => { setEditing(false); setError('') }}>
                  Cancelar
                </button>
                <button className={styles.saveBtn} onClick={handleSave}>
                  Salvar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
