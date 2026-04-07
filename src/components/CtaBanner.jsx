import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  return (
    <section className={styles.section} id="escolas">
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.left}>
            <span className={styles.tag}>Para escolas</span>
            <h2 className={styles.title}>
              Leve o Plurall para<br />sua escola
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
                  <span className={styles.itemCheck}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div className={styles.actions}>
              <a href="#" className={styles.btnPrimary}>Quero para minha escola</a>
              <a href="#" className={styles.btnGhost}>Agendar demonstração</a>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.dashCard}>
              <div className={styles.dashHeader}>
                <span className={styles.dashTitle}>📊 Painel da Escola</span>
                <span className={styles.dashBadge}>Ao vivo</span>
              </div>
              <div className={styles.dashStats}>
                {[
                  { label: 'Alunos ativos hoje', value: '1.247', icon: '👥' },
                  { label: 'Questões respondidas', value: '8.432', icon: '📝' },
                  { label: 'Horas de estudo', value: '2.891', icon: '⏱️' },
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
