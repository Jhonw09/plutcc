import styles from './Logos.module.css'

const logos = [
  { name: 'Objetivo' },
  { name: 'Anglo'    },
  { name: 'Poliedro' },
  { name: 'COC'      },
  { name: 'SEB'      },
  { name: 'Pitágoras'},
  { name: 'Marista'  },
  { name: 'Positivo' },
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
                <div className={styles.logoIcon}>
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
