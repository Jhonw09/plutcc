import { useState }      from 'react'
import { useNavigate }   from 'react-router-dom'
import AdminLayout        from '../components/admin/AdminLayout'
import Icon               from '../components/ui/Icon'
import MfaSecuritySection from '../components/ui/MfaSecuritySection'
import DeleteAccountModal from '../components/ui/DeleteAccountModal'
import { useAuth }        from '../context/AuthContext'
import styles from './TeacherConfiguracoesPage.module.css'

export default function AdminConfiguracoesPage() {
  const navigate = useNavigate()
  const { user, deleteUserWithAuth, requestDeleteChallenge } = useAuth()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDeleteConfirm(senha, codigoMfa) {
    await deleteUserWithAuth(senha, codigoMfa)
    navigate('/')
  }

  return (
    <AdminLayout>
      {confirmDelete && (
        <DeleteAccountModal
          mfaHabilitado={user.mfaHabilitado}
          isGoogleUser={user.isGoogleUser}
          onRequestChallenge={requestDeleteChallenge}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(false)}
          roleLabel="conta de administrador"
        />
      )}
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
                <p className={styles.cardSub}>Nome e informações pessoais.</p>
              </div>
            </div>
            <div className={styles.formActions}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Edição de perfil de administrador não disponível nesta versão.
              </span>
            </div>
          </section>

          {/* ── MFA — obrigatório para ADMIN ── */}
          <MfaSecuritySection
            mfaHabilitado={user.mfaHabilitado}
            isAdmin={true}
            isGoogleUser={user.isGoogleUser}
            onToggle={null}
            cardStyles={styles}
          />

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
                Ao excluir sua conta de administrador, todos os seus dados serão permanentemente removidos da plataforma.
              </p>
              <button className={styles.btnDanger} onClick={() => setConfirmDelete(true)}>
                <Icon name="trash" size={14} /> Excluir minha conta
              </button>
            </div>
          </section>

        </div>
      </div>
    </AdminLayout>
  )
}
