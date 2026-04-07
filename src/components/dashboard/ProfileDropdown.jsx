import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './ProfileDropdown.module.css'

const ROLE_LABELS = { student: 'Aluno', teacher: 'Professor', admin: 'Admin' }

export default function ProfileDropdown() {
  const { user, updateUser, deleteUser, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen]               = useState(false)
  const [editing, setEditing]         = useState(false)
  const [confirmDelete, setConfirm]   = useState(false)
  const [form, setForm]               = useState({ name: '', email: '', password: '' })
  const [error, setError]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const ref = useRef(null)

  // Close panel on outside click — reset all sub-states too
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setEditing(false)
        setConfirm(false)
        setError('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openDropdown() {
    setForm({ name: user?.name ?? '', email: user?.email ?? '', password: '' })
    setEditing(false)
    setConfirm(false)
    setError('')
    setOpen(o => !o)
  }

  async function handleSave() {
    if (!form.name.trim())  { setError('Nome não pode ser vazio.');   return }
    if (!form.email.trim()) { setError('E-mail não pode ser vazio.'); return }

    setSaving(true)
    setError('')
    try {
      await updateUser({
        nome:  form.name.trim(),
        email: form.email.trim(),
        senha: form.password.trim(),   // empty string → updateUser won't send it
      })
      setEditing(false)
    } catch (err) {
      setError(err.message ?? 'Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await deleteUser()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Erro ao excluir conta.')
      setDeleting(false)
      setConfirm(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase()

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={`${styles.avatar} ${open ? styles.avatarActive : ''}`}
        onClick={openDropdown}
        aria-label="Perfil"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Perfil do usuário">

          {!editing && !confirmDelete && (
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

              <button className={styles.actionBtn} onClick={() => setConfirm(true)}>
                🗑️ Excluir conta
              </button>

              <div className={styles.divider} />

              <button className={styles.logoutBtn} onClick={handleLogout}>
                🚪 Sair da conta
              </button>
            </>
          )}

          {editing && (
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
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={saving}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nova senha</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={saving}
                  autoComplete="new-password"
                />
                <span className={styles.fieldHint}>Mínimo 6 caracteres se preenchido</span>
              </div>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <div className={styles.editActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => { setEditing(false); setError('') }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </>
          )}

          {confirmDelete && (
            /* ── Delete confirmation ── */
            <>
              <p className={styles.editTitle}>Excluir conta</p>
              <p className={styles.deleteWarning}>
                Essa ação é permanente e não pode ser desfeita. Tem certeza?
              </p>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <div className={styles.editActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => { setConfirm(false); setError('') }}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  )
}
