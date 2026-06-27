import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPasswordValidationMessage, isValidEmail } from '../../utils/validation'
import Icon from '../ui/Icon'
import styles from './ProfileDropdown.module.css'

const ROLE_LABELS = { student: 'Aluno', teacher: 'Professor', admin: 'Admin' }
const MODE = { VIEW: 'view', PROFILE: 'profile', PASSWORD: 'password', DELETE: 'delete' }

export default function ProfileDropdown() {
  const { user, updateUser, changePassword, deleteUser, logout } = useAuth()
  const navigate = useNavigate()

  const [open, setOpen]         = useState(false)
  const [mode, setMode]         = useState(MODE.VIEW)
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' })
  const [error, setError]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setMode(MODE.VIEW); setError('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function openDropdown() {
    setForm({ name: user?.name ?? '', email: user?.email ?? '', password: '' })
    setPwForm({ current: '', next: '', confirm: '' })
    setMode(MODE.VIEW)
    setError('')
    setOpen(o => !o)
  }

  function goTo(m) { setError(''); setMode(m) }

  async function handleSaveProfile() {
    if (!form.name.trim())  { setError('Nome não pode ser vazio.'); return }
    if (!form.email.trim()) { setError('E-mail não pode ser vazio.'); return }
    if (!isValidEmail(form.email.trim())) { setError('E-mail invalido.'); return }
    if (!form.password.trim()) { setError('Informe sua senha para confirmar.'); return }
    setSaving(true); setError('')
    try {
      await updateUser({ nome: form.name.trim(), email: form.email.trim(), senha: form.password.trim() })
      goTo(MODE.VIEW)
    } catch (err) {
      setError(err.message ?? 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  async function handleChangePassword() {
    if (!pwForm.current.trim()) { setError('Informe a senha atual.'); return }
    const msg = getPasswordValidationMessage(pwForm.next.trim())
    if (msg) { setError(msg); return }
    if (pwForm.next !== pwForm.confirm) { setError('As senhas não coincidem.'); return }
    setSaving(true); setError('')
    try {
      await changePassword({ senhaAtual: pwForm.current.trim(), senha: pwForm.next.trim() })
      setPwForm({ current: '', next: '', confirm: '' })
      goTo(MODE.VIEW)
    } catch (err) {
      setError(err.message ?? 'Erro ao alterar senha.')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true); setError('')
    try {
      await deleteUser()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Erro ao excluir conta.')
      setDeleting(false); goTo(MODE.VIEW)
    }
  }

  function handleForgotPassword() {
    setOpen(false)
    logout()
    navigate('/')
    // pequeno delay para o modal de login aparecer com modo forgot
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-forgot-password')), 100)
  }

  function handleLogout() { logout(); navigate('/', { replace: true }) }

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

          {mode === MODE.VIEW && (
            <>
              <div className={styles.profileTop}>
                <div className={styles.bigAvatar}>{initials}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{user?.name}</span>
                  <span className={styles.profileEmail}>{user?.email ?? '—'}</span>
                  <span className={styles.roleBadge}>{ROLE_LABELS[user?.role] ?? user?.role}</span>
                </div>
              </div>
              <div className={styles.divider} />
              <button className={styles.actionBtn} onClick={() => { setOpen(false); navigate(user?.role === 'teacher' ? '/teacher-dashboard/editar-perfil' : '/dashboard/editar-perfil') }}>
                <Icon name="pencil" size={14} /> Editar perfil
              </button>
              <button className={styles.actionBtn} onClick={() => goTo(MODE.DELETE)}>
                <Icon name="trash" size={14} /> Excluir conta
              </button>
              <div className={styles.divider} />
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <Icon name="doorOpen" size={14} /> Sair da conta
              </button>
            </>
          )}

          {mode === MODE.PROFILE && (
            <>
              <p className={styles.editTitle}>Editar perfil</p>
              <div className={styles.field}>
                <label className={styles.label}>Nome</label>
                <input className={styles.input} value={form.name} autoFocus disabled={saving}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>E-mail</label>
                <input className={styles.input} type="email" value={form.email} disabled={saving}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {!user.isGoogleUser && (
                <div className={styles.field}>
                  <label className={styles.label}>Confirme sua senha para salvar</label>
                  <input className={styles.input} type="password" value={form.password} disabled={saving}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                </div>
              )}
              {error && <p className={styles.error} role="alert">{error}</p>}
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => goTo(MODE.VIEW)} disabled={saving}>Cancelar</button>
                <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
              <div className={styles.divider} />
              {!user.isGoogleUser && (
                <button className={styles.actionBtn} onClick={() => goTo(MODE.PASSWORD)}>
                  <Icon name="key" size={14} /> Alterar senha
                </button>
              )}
            </>
          )}

          {mode === MODE.PASSWORD && (
            <>
              <p className={styles.editTitle}>Alterar senha</p>
              <div className={styles.field}>
                <label className={styles.label}>Senha atual</label>
                <input className={styles.input} type="password" value={pwForm.current} autoFocus
                  disabled={saving} autoComplete="current-password"
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Nova senha</label>
                <input className={styles.input} type="password" value={pwForm.next}
                  disabled={saving} autoComplete="new-password"
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
                <span className={styles.fieldHint}>Mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial.</span>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirmar nova senha</label>
                <input className={styles.input} type="password" value={pwForm.confirm}
                  disabled={saving} autoComplete="new-password"
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => goTo(MODE.PROFILE)} disabled={saving}>Voltar</button>
                <button className={styles.saveBtn} onClick={handleChangePassword} disabled={saving}>
                  {saving ? 'Salvando...' : 'Alterar'}
                </button>
              </div>
              <div className={styles.divider} />
              <button className={styles.forgotLink} onClick={handleForgotPassword}>
                Esqueci minha senha
              </button>
            </>
          )}

          {mode === MODE.DELETE && (
            <>
              <p className={styles.editTitle}>Excluir conta</p>
              <p className={styles.deleteWarning}>Essa ação é permanente e não pode ser desfeita. Tem certeza?</p>
              {error && <p className={styles.error} role="alert">{error}</p>}
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => goTo(MODE.VIEW)} disabled={deleting}>Cancelar</button>
                <button className={styles.deleteBtn} onClick={handleDelete} disabled={deleting}>
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
