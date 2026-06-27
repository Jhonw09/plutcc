import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout  from '../components/dashboard/DashboardLayout'
import { InputField }   from '../components/ui/InputField'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Toast }        from '../components/ui/Toast'
import Icon             from '../components/ui/Icon'
import { useAuth }      from '../context/AuthContext'
import { useToast }     from '../hooks/useToast'
import { getPasswordValidationMessage } from '../utils/validation'
import styles from './TeacherConfiguracoesPage.module.css'

export default function StudentConfiguracoesPage() {
  const navigate = useNavigate()
  const { user, changePassword, deleteUser } = useAuth()
  const { toasts, toast, dismiss } = useToast()

  const [senhaAtual,  setSenhaAtual]  = useState('')
  const [senhaNova,   setSenhaNova]   = useState('')
  const [senhaRep,    setSenhaRep]    = useState('')
  const [savingSenha, setSavingSenha] = useState(false)
  const [senhaError,  setSenhaError]  = useState('')
  const [senhaOk,     setSenhaOk]     = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)

  async function handleChangeSenha(e) {
    e.preventDefault()
    setSenhaError('')
    if (!senhaAtual) return setSenhaError('Informe a senha atual.')
    const msg = getPasswordValidationMessage(senhaNova)
    if (msg) return setSenhaError(msg)
    if (senhaNova !== senhaRep) return setSenhaError('As senhas não coincidem.')
    setSavingSenha(true)
    try {
      await changePassword({ senhaAtual, senha: senhaNova })
      setSenhaAtual(''); setSenhaNova(''); setSenhaRep('')
      setSenhaOk(true)
      setTimeout(() => setSenhaOk(false), 3000)
    } catch (err) {
      setSenhaError(err.message || 'Erro ao alterar senha.')
    } finally {
      setSavingSenha(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteUser()
      navigate('/')
    } catch (err) {
      toast(err.message || 'Erro ao excluir conta.', 'error')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <DashboardLayout>
      {confirmDelete && (
        <ConfirmModal
          title="Excluir conta"
          message="Tem certeza? Todos os seus dados serão permanentemente excluídos. Esta ação não pode ser desfeita."
          confirmLabel={deleting ? 'Excluindo...' : 'Excluir minha conta'}
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      <Toast toasts={toasts} onDismiss={dismiss} />

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.sub}>Gerencie suas informações de conta.</p>
        </div>

        <div className={styles.sections}>

          {/* ── Perfil ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIconWrap}><Icon name="user" size={18} /></span>
              <div>
                <h2 className={styles.cardTitle}>Perfil</h2>
                <p className={styles.cardSub}>Nome, e-mail e informações pessoais.</p>
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => navigate('/dashboard/editar-perfil')}
              >
                <Icon name="pencil" size={14} /> Editar perfil
              </button>
            </div>
          </section>

          {/* ── Segurança ── */}
          {user.isGoogleUser ? (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIconWrap}><Icon name="lock" size={18} /></span>
                <div>
                  <h2 className={styles.cardTitle}>Segurança da conta</h2>
                  <p className={styles.cardSub}>Sua conta é gerenciada pelo Google.</p>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Você entrou com o Google. Para alterar sua senha, acesse as configurações da sua conta Google em{' '}
                <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                  myaccount.google.com
                </a>.
              </p>
            </section>
          ) : (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIconWrap}><Icon name="lock" size={18} /></span>
                <div>
                  <h2 className={styles.cardTitle}>Segurança da conta</h2>
                  <p className={styles.cardSub}>Altere sua senha. Use uma senha forte com ao menos 8 caracteres.</p>
                </div>
              </div>
              <form onSubmit={handleChangeSenha} className={styles.form} noValidate>
                <InputField id="senhaAtual" label="Senha atual" type="password"
                  value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
                  placeholder="••••••••" disabled={savingSenha} />
                <div className={styles.row2}>
                  <InputField id="senhaNova" label="Nova senha" type="password"
                    value={senhaNova} onChange={e => setSenhaNova(e.target.value)}
                    placeholder="••••••••" disabled={savingSenha} />
                  <InputField id="senhaRep" label="Confirmar nova senha" type="password"
                    value={senhaRep} onChange={e => setSenhaRep(e.target.value)}
                    placeholder="••••••••" disabled={savingSenha} />
                </div>
                {senhaError && <p className={styles.errorMsg}><Icon name="alertCircle" size={13} /> {senhaError}</p>}
                {senhaOk    && <p className={styles.successMsg}><span>✓</span> Senha alterada com sucesso.</p>}
                <div className={styles.formActions}>
                  <button type="submit" className={`${styles.btnPrimary} ${senhaOk ? styles.btnSaved : ''}`} disabled={savingSenha}>
                    {savingSenha ? 'Alterando…' : senhaOk ? '✓ Alterada' : 'Alterar senha'}
                  </button>
                </div>
              </form>
              <div className={styles.forgotPasswordHint}>
                <Icon name="alertCircle" size={13} />
                Não lembra sua senha?{' '}
                <button type="button" className={styles.forgotPasswordLink} onClick={() => navigate('/redefinir-senha-solicitacao')}>
                  Esqueci minha senha
                </button>
              </div>
            </section>
          )}

          {/* ── Zona de perigo ── */}
          <section className={`${styles.card} ${styles.dangerCard}`}>
            <div className={styles.cardHeader}>
              <span className={`${styles.cardIconWrap} ${styles.dangerIcon}`}><Icon name="trash" size={18} /></span>
              <div>
                <h2 className={styles.cardTitle}>Excluir conta</h2>
                <p className={styles.cardSub}>Esta ação é permanente e não pode ser desfeita.</p>
              </div>
            </div>
            <div className={styles.dangerBody}>
              <p className={styles.dangerText}>
                Ao excluir sua conta, todos os seus dados e progresso serão permanentemente removidos da plataforma.
              </p>
              <button className={styles.btnDanger} onClick={() => setConfirmDelete(true)}>
                <Icon name="trash" size={14} /> Excluir minha conta
              </button>
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  )
}
