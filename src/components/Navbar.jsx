import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const navItems = [
  { label: 'Para Alunos', href: '#alunos' },
  { label: 'Para Escolas', href: '#escolas' },
  { label: 'Conteúdos', href: '#conteudos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Blog', href: '#blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
            <text x="0" y="26" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="28" fill="#FFFFFF">plu</text>
            <text x="46" y="26" fontFamily="Inter,sans-serif" fontWeight="900" fontSize="28" fill="#6C5CE7">rall</text>
          </svg>
        </a>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {navItems.map(n => (
            <a key={n.label} href={n.href} className={styles.navLink}>{n.label}</a>
          ))}
        </nav>

        {/* Actions */}
        <div className={styles.actions}>
          <a href="#" className={styles.loginBtn}>Entrar</a>
          <a href="#" className={styles.registerBtn}>Cadastre-se grátis</a>
        </div>

        {/* Hamburger */}
        <button className={styles.burger} onClick={() => setOpen(!open)} aria-label="Menu">
          <span className={open ? styles.burgerOpen : ''} />
          <span className={open ? styles.burgerOpen : ''} />
          <span className={open ? styles.burgerOpen : ''} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={styles.mobileMenu}>
          {navItems.map(n => (
            <a key={n.label} href={n.href} className={styles.mobileLink} onClick={() => setOpen(false)}>{n.label}</a>
          ))}
          <div className={styles.mobileDivider} />
          <a href="#" className={styles.mobileLink}>Entrar</a>
          <a href="#" className={`${styles.mobileLink} ${styles.mobileCta}`}>Cadastre-se grátis</a>
        </div>
      )}
    </header>
  )
}
