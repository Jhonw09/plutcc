import { Link } from 'react-router-dom'
import { useCookieConsent } from '../context/CookieConsentContext'
import styles from './Footer.module.css'

export default function Footer() {
  const { openPreferences } = useCookieConsent()
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <svg width="210" height="30" viewBox="0 0 210 30" fill="none">
                <text x="0" y="24" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="26" fill="#FFFFFF">Study</text>
                <text x="80" y="24" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="26" fill="#6C5CE7">Connect</text>
              </svg>
            </Link>
            <p className={styles.tagline}>
              A plataforma de estudos que conecta alunos, professores e trilhas de aprendizagem.
            </p>
          </div>

          {/* Plataforma */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Plataforma</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/login">Entrar</Link></li>
              <li><Link to="/cadastro">Criar conta</Link></li>
            </ul>
          </div>

          {/* Suporte */}
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Suporte</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/ajuda">Ajuda</Link></li>
              <li><Link to="/contato">Contato</Link></li>
              <li><Link to="/privacidade">Privacidade</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
              <li><Link to="/direitos-titular">Meus direitos</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} StudyConnect. Todos os direitos reservados.</p>
          <div className={styles.bottomLinks}>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/cookies">Cookies</Link>
            <button
              onClick={openPreferences}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font)', padding: 0, transition: 'color .15s' }}
              onMouseOver={e => e.target.style.color = 'var(--text-secondary)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
            >
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
