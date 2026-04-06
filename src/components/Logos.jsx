import styles from './Logos.module.css'

const logos = [
  { name: 'Objetivo', color: '#1a56db' },
  { name: 'Anglo', color: '#e02424' },
  { name: 'Poliedro', color: '#057a55' },
  { name: 'COC', color: '#ff6900' },
  { name: 'SEB', color: '#7c3aed' },
  { name: 'Pitágoras', color: '#1a56db' },
  { name: 'Marista', color: '#e02424' },
  { name: 'Positivo', color: '#057a55' },
]

export default function Logos() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <p className={styles.label}>Confiado pelas maiores redes de ensino do Brasil</p>
        <div className={styles.track}>
          <div className={styles.logos}>
            {[...logos, ...logos].map((l, i) => (
              <div key={i} className={styles.logo}>
                <div className={styles.logoIcon} style={{ background: l.color + '18', color: l.color }}>
                  {l.name[0]}
                </div>
                <span className={styles.logoName}>{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
