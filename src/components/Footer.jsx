import styles from './Footer.module.css'

const cols = {
  'Plataforma': ['Videoaulas', 'Exercícios', 'Simulados', 'Trilhas com IA', 'App Mobile', 'Offline'],
  'Disciplinas': ['Matemática', 'Português', 'Ciências', 'História', 'Inglês', 'Ver todas'],
  'Para Escolas': ['Como funciona', 'Planos para escolas', 'Integrações', 'Cases de sucesso', 'Fale com vendas'],
  'Empresa': ['Sobre nós', 'Blog', 'Carreiras', 'Imprensa', 'Contato'],
  'Suporte': ['Central de Ajuda', 'Status', 'Termos de Uso', 'Privacidade', 'Cookies'],
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <a href="/" className={styles.logo}>
              <svg width="210" height="30" viewBox="0 0 210 30" fill="none">
                <text x="0" y="24" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="26" fill="#FFFFFF">Study</text>
                <text x="80" y="24" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="26" fill="#6C5CE7">Connect</text>
              </svg>
            </a>
            <p className={styles.tagline}>
              A plataforma de estudos que conecta alunos, professores e escolas em todo o Brasil.
            </p>
            <div className={styles.social}>
              {[
                { label: 'Instagram', icon: '📸' },
                { label: 'YouTube',   icon: '▶️' },
                { label: 'Facebook',  icon: '👍' },
                { label: 'LinkedIn',  icon: '💼' },
              ].map(s => (
                <a key={s.label} href="#" className={styles.socialBtn} aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
            <div className={styles.apps}>
              <a href="#" className={styles.appBtn}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M11.182 10.5c-.182.364-.273.546-.455.91-.273.546-.637 1.09-1.09 1.455-.455.364-.91.546-1.455.364-.364-.091-.728-.273-1.182-.273-.455 0-.819.182-1.182.273-.546.182-1 0-1.455-.364-.455-.364-.819-.91-1.09-1.455C2.91 10.5 2.5 9.5 2.5 8.5c0-1.09.364-2 1-2.636.546-.546 1.273-.91 2-.91.364 0 .728.091 1.09.273.273.091.546.273.819.273.273 0 .546-.182.819-.273.364-.182.728-.273 1.09-.273.637 0 1.273.273 1.728.728-.637.364-1.09 1-1.09 1.818 0 .728.364 1.364.91 1.818.182.182.364.273.546.364-.091.273-.182.546-.273.819zM8.5 3.5c0 .637-.273 1.273-.728 1.728-.455.455-1.09.728-1.728.728 0-.637.273-1.273.728-1.728C7.227 3.773 7.863 3.5 8.5 3.5z"/></svg>
                App Store
              </a>
              <a href="#" className={styles.appBtn}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M2 2.5L8.5 8 2 13.5V2.5zM3 4.5v7l4.5-3.5L3 4.5zM9.5 8l4.5 3.5V4.5L9.5 8z"/></svg>
                Google Play
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([title, links]) => (
            <div key={title} className={styles.col}>
              <h4 className={styles.colTitle}>{title}</h4>
              <ul className={styles.colLinks}>
                {links.map(link => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} StudyConnect Educação. Todos os direitos reservados.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Termos de Uso</a>
            <a href="#">Privacidade</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
