import { Link } from 'react-router-dom'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  return (
    <section className={styles.section} id="escolas">
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.left}>
            <span className={styles.tag}>Ideia para o futuro</span>
            <h2 className={styles.title}>
              StudyConnect para escolas
            </h2>
            <p className={styles.desc}>
              Esta funcionalidade ainda não existe. É uma ideia que temos para o futuro — caso o projeto cresça, queremos oferecer uma solução institucional para escolas conectarem alunos e professores em um só lugar.
            </p>
            <div className={styles.items}>
              {[
                'Gestão de turmas e matrículas',
                'Relatórios para gestores',
                'Trilhas personalizadas por escola',
                'Integração com sistemas existentes',
              ].map((item, i) => (
                <div key={i} className={styles.item}>
                  <span className={styles.itemCheck}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className={styles.actions}>
              <Link to="/contato" className={styles.btnPrimary}>Tenho interesse</Link>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.dashCard}>
              <div className={styles.dashHeader}>
                <span className={styles.dashTitle}>Painel da Escola</span>
                <span className={styles.dashBadge}>Ao vivo</span>
              </div>
              <div className={styles.dashStats}>
                {[
                  { label: 'Alunos ativos hoje',    value: '1.247', icon: '👥' },
                  { label: 'Aulas assistidas',       value: '8.432', icon: '▶️'  },
                  { label: 'Horas de estudo',        value: '2.891', icon: '🕐'  },
                ].map((s, i) => (
                  <div key={i} className={styles.dashStat}>
                    <span className={styles.dashStatIcon}>{s.icon}</span>
                    <div>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.dashChart}>
                {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                  <div key={i} className={styles.dashBar} style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className={styles.dashDays}>
                {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
