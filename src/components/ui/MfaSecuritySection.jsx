import { useState } from 'react'
import Icon from './Icon'
import { InputField } from './InputField'
import styles from './MfaSecuritySection.module.css'

/**
 * Seção "Autenticação em dois fatores" para páginas de Configurações.
 *
 * Props:
 *  - mfaHabilitado: boolean  — estado atual vindo do user no AuthContext
 *  - isAdmin: boolean        — ADMIN vê mensagem de obrigatoriedade, sem toggle
 *  - isGoogleUser: boolean   — usuário Google não tem senha local para confirmar
 *  - onToggle: (enable, senha) => Promise<void>  — chama AuthContext.toggleMfa
 *  - cardStyles: object      — classes CSS do card pai (reutiliza o .module.css da página)
 */
export default function MfaSecuritySection({ mfaHabilitado, isAdmin, isGoogleUser, onToggle, cardStyles }) {
  const cs = cardStyles // alias para brevidade

  const [modalOpen,  setModalOpen]  = useState(false)
  const [enabling,   setEnabling]   = useState(false) // true = ativar, false = desativar
  const [senha,      setSenha]      = useState('')
  const [senhaError, setSenhaError] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  function openModal(enable) {
    setEnabling(enable)
    setSenha('')
    setSenhaError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSenha('')
    setSenhaError('')
  }

  async function handleConfirm(e) {
    e.preventDefault()
    if (!senha) { setSenhaError('Informe sua senha atual.'); return }
    setLoading(true)
    setSenhaError('')
    try {
      await onToggle(enabling, senha)
      setSuccessMsg(enabling ? 'MFA ativado com sucesso.' : 'MFA desativado com sucesso.')
      setTimeout(() => setSuccessMsg(''), 4000)
      closeModal()
    } catch (err) {
      setSenhaError(err.message || 'Erro ao alterar configuração de MFA.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Modal de confirmação com senha ── */}
      {modalOpen && (
        <div className={styles.backdrop} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mfa-modal-title"
          >
            <div className={styles.modalIcon}>
              <Icon name="shield" size={26} />
            </div>
            <h3 id="mfa-modal-title" className={styles.modalTitle}>
              {enabling ? 'Ativar autenticação em dois fatores' : 'Desativar autenticação em dois fatores'}
            </h3>
            <p className={styles.modalDesc}>
              {enabling
                ? 'Para ativar o MFA, confirme sua senha atual. A partir do próximo login, você receberá um código por e-mail.'
                : 'Para desativar o MFA, confirme sua senha atual. Você não precisará mais de código no login.'}
            </p>
            <form onSubmit={handleConfirm} noValidate className={styles.modalForm}>
              <InputField
                id="mfa-senha-confirm"
                label="Senha atual"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => { setSenha(e.target.value); setSenhaError('') }}
                error={senhaError}
                disabled={loading}
                autoFocus
              />
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal} disabled={loading}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={enabling ? styles.confirmBtnEnable : styles.confirmBtnDisable}
                  disabled={loading}
                >
                  {loading ? 'Aguarde…' : enabling ? 'Ativar MFA' : 'Desativar MFA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Card da seção ── */}
      <section className={cs.card}>
        <div className={cs.cardHeader}>
          <span className={cs.cardIconWrap}><Icon name="shield" size={18} /></span>
          <div>
            <h2 className={cs.cardTitle}>Autenticação em dois fatores</h2>
            <p className={cs.cardSub}>
              Adicione uma camada extra de segurança à sua conta. Após informar sua senha, você precisará
              informar um código enviado para seu e-mail.
            </p>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        {successMsg && (
          <p className={cs.successMsg}><span>✓</span> {successMsg}</p>
        )}

        {isAdmin ? (
          /* ADMIN — MFA obrigatório, sem toggle */
          <div className={styles.statusRow}>
            <div className={styles.statusBadgeActive}>
              <Icon name="checkCircle" size={14} />
              Ativado
            </div>
            <p className={styles.adminNote}>
              O MFA é obrigatório para administradores e não pode ser desativado.
            </p>
          </div>
        ) : isGoogleUser ? (
          /* Usuário Google — sem senha local */
          <div className={styles.statusRow}>
            <div className={mfaHabilitado ? styles.statusBadgeActive : styles.statusBadgeInactive}>
              <Icon name={mfaHabilitado ? 'checkCircle' : 'alertCircle'} size={14} />
              {mfaHabilitado ? 'Ativado' : 'Desativado'}
            </div>
            <p className={styles.googleNote}>
              Sua conta é gerenciada pelo Google. A configuração de MFA por senha não está disponível para contas Google.
            </p>
          </div>
        ) : (
          /* ALUNO / PROFESSOR com senha local */
          <div className={styles.statusRow}>
            <div className={mfaHabilitado ? styles.statusBadgeActive : styles.statusBadgeInactive}>
              <Icon name={mfaHabilitado ? 'checkCircle' : 'alertCircle'} size={14} />
              {mfaHabilitado ? 'Ativado' : 'Desativado'}
            </div>
            <button
              type="button"
              className={mfaHabilitado ? styles.btnDisableMfa : styles.btnEnableMfa}
              onClick={() => openModal(!mfaHabilitado)}
            >
              <Icon name={mfaHabilitado ? 'unlock' : 'lock'} size={14} />
              {mfaHabilitado ? 'Desativar MFA' : 'Ativar MFA'}
            </button>
          </div>
        )}
      </section>
    </>
  )
}
