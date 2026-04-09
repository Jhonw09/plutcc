import { useCTA } from '../hooks/useCTA'
import Icon from './ui/Icon'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  const handleCTA = useCTA()
  return (
    <section className={styles.section} id="escolas">
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.left}>
            <span className={styles.tag}>Para escolas</span>
            <h2 className={styles.title}>
              Leve o StudyConnect para<br />sua escola
            </h2>
            <p className={styles.desc}>
              Mais de 20 mil escolas já usam o StudyConnect para conectar alunos e professores. Implemente em dias, não em meses.
            </p>
            <div className={styles.items}>
              {[
                'Integração com qualquer sistema escolar',
                'Treinamento completo para professores',
                'Suporte dedicado 24/7',
                'Relatórios para gestores e pais',
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
              <a href="/cadastro" className={styles.btnPrimary} onClick={handleCTA}>Quero para minha escola</a>
              <a href="/cadastro" className={styles.btnGhost}   onClick={handleCTA}>Agendar demonstração</a>
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
                  { label: 'Alunos ativos hoje',    value: '1.247', icon: 'users'   },
                  { label: 'Questões respondidas',   value: '8.432', icon: 'pencil'  },
                  { label: 'Horas de estudo',         value: '2.891', icon: 'clock'   },
                ].map((s, i) => (
                  <div key={i} className={styles.dashStat}>
                    <span className={styles.dashStatIcon}><Icon name={s.icon} size={18} /></span>
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
