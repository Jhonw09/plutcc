import styles from './DashboardHeader.module.css'

export default function DashboardHeader({ user = { name: 'João', avatar: 'J' } }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <header className={styles.header}>
      {/* Left — greeting */}
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          {greeting}, <span className={styles.name}>{user.name}</span> 👋
        </h1>
        <p className={styles.sub}>Veja o que você tem pra hoje</p>
      </div>

      {/* Right — search + avatar */}
      <div className={styles.right}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar aulas, exercícios..."
            className={styles.searchInput}
          />
        </div>

        <button className={styles.notifBtn} aria-label="Notificações">
          🔔
          <span className={styles.notifDot} />
        </button>

        <div className={styles.avatar}>{user.avatar}</div>
      </div>
    </header>
  )
}
