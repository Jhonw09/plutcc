import { Link } from 'react-router-dom'
import { useCookieConsent } from '../../context/CookieConsentContext'
import styles from './CookieBanner.module.css'

export default function CookieBanner() {
  const { bannerVisible, open, acceptAll, rejectOptional, closePreferences } = useCookieConsent()

  // Painel de preferências (aberto via "Gerenciar" ou link do rodapé)
  if (open) {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Preferências de cookies">
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Preferências de cookies</h2>
          <p className={styles.panelDesc}>
            O StudyConnect usa apenas armazenamento estritamente necessário para o
            funcionamento da plataforma. Não utilizamos cookies de rastreamento,
            publicidade ou analytics de terceiros.
          </p>

          <div className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>Essenciais</span>
              <span className={styles.badge}>Sempre ativos</span>
            </div>
            <p className={styles.categoryDesc}>
              Necessários para autenticação, segurança e funcionamento básico da
              plataforma. Não podem ser desativados.
            </p>
            <ul className={styles.itemList}>
              <li><code>sc_user</code> — sessão do usuário (localStorage)</li>
              <li><code>sc_access_token</code> — token JWT (sessionStorage)</li>
              <li><code>sc_cookie_consent</code> — registro desta escolha (localStorage)</li>
            </ul>
          </div>

          <div className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>Terceiros (Google)</span>
              <span className={styles.badgeInfo}>Informativo</span>
            </div>
            <p className={styles.categoryDesc}>
              O Google Identity Services (login com Google) e o Google Fonts podem
              registrar dados conforme a{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                política do Google
              </a>. O StudyConnect não controla esses cookies.
            </p>
          </div>

          <p className={styles.moreInfo}>
            Saiba mais na <Link to="/cookies" onClick={closePreferences}>Página de Cookies</Link> e na{' '}
            <Link to="/privacidade" onClick={closePreferences}>Política de Privacidade</Link>.
          </p>

          <div className={styles.panelActions}>
            <button className={styles.btnPrimary} onClick={() => { acceptAll(); closePreferences() }}>
              Entendido
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!bannerVisible) return null

  return (
    <div className={styles.banner} role="region" aria-label="Aviso de cookies">
      <div className={styles.bannerContent}>
        <p className={styles.bannerText}>
          Usamos armazenamento essencial para manter sua sessão e preferências.
          Não utilizamos rastreamento ou publicidade.{' '}
          <Link to="/cookies" className={styles.bannerLink}>Saiba mais</Link>
        </p>
        <div className={styles.bannerActions}>
          <button className={styles.btnSecondary} onClick={rejectOptional}>
            Rejeitar não necessários
          </button>
          <button className={styles.btnPrimary} onClick={acceptAll}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
