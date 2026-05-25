import Icon from '../ui/Icon'
import styles from './TrailEstatisticas.module.css'

const METRICS = [
  { icon: 'users',      label: 'Alunos matriculados', value: '48',  delta: '+6 este mês',  positive: true  },
  { icon: 'checkCircle',label: 'Aulas concluídas',    value: '312', delta: '+24 esta semana', positive: true },
  { icon: 'alertCircle',label: 'Dúvidas enviadas',    value: '17',  delta: '5 pendentes',  positive: false },
  { icon: 'activity',   label: 'Taxa de conclusão',   value: '73%', delta: '+4% vs mês anterior', positive: true },
]

const RECENT = [
  { aluno: 'Ana Souza',    acao: 'concluiu a aula',  aula: 'Introdução à Álgebra',  time: '2h atrás'  },
  { aluno: 'Carlos Lima',  acao: 'enviou uma dúvida', aula: 'Funções do 1º Grau',   time: '4h atrás'  },
  { aluno: 'Mariana Costa',acao: 'concluiu a aula',  aula: 'Geometria Plana',       time: '6h atrás'  },
  { aluno: 'Pedro Alves',  acao: 'iniciou a aula',   aula: 'Introdução à Álgebra',  time: '1 dia atrás'},
  { aluno: 'Julia Ramos',  acao: 'concluiu a aula',  aula: 'Funções do 1º Grau',   time: '1 dia atrás'},
]

export default function TrailEstatisticas() {
  return (
    <div className={styles.container}>

      {/* Cards métricos */}
      <div className={styles.metricsGrid} data-tour="estatisticas-metrics">
        {METRICS.map((m, i) => (
          <div key={i} className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Icon name={m.icon} size={18} />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricValue}>{m.value}</span>
              <span className={styles.metricLabel}>{m.label}</span>
            </div>
            <span className={`${styles.metricDelta} ${m.positive ? styles.deltaPositive : styles.deltaNeutral}`}>
              {m.delta}
            </span>
          </div>
        ))}
      </div>

      {/* Gráficos placeholder */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Acessos por semana</h3>
              <p className={styles.chartSub}>Últimos 30 dias</p>
            </div>
            <span className={styles.chartBadge}>Em breve</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <div className={styles.fakeBars}>
              {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className={styles.fakeBar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className={styles.placeholderHint}>
              <Icon name="barChart" size={14} /> Gráfico de barras disponível em breve
            </p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Progresso por aula</h3>
              <p className={styles.chartSub}>% de alunos que concluíram</p>
            </div>
            <span className={styles.chartBadge}>Em breve</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <div className={styles.fakeProgressList}>
              {[
                { label: 'Introdução à Álgebra', pct: 88 },
                { label: 'Funções do 1º Grau',   pct: 74 },
                { label: 'Geometria Plana',       pct: 61 },
                { label: 'Equações',              pct: 45 },
              ].map((row, i) => (
                <div key={i} className={styles.fakeProgressRow}>
                  <span className={styles.fakeProgressLabel}>{row.label}</span>
                  <div className={styles.fakeProgressTrack}>
                    <div className={styles.fakeProgressFill} style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className={styles.fakeProgressPct}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      <div className={styles.recentCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>Atividade recente</h3>
            <p className={styles.chartSub}>Últimas ações dos alunos</p>
          </div>
        </div>
        <div className={styles.recentList}>
          {RECENT.map((r, i) => (
            <div key={i} className={styles.recentRow}>
              <div className={styles.recentAvatar}>{r.aluno.charAt(0)}</div>
              <div className={styles.recentInfo}>
                <span className={styles.recentText}>
                  <strong>{r.aluno}</strong> {r.acao} <em>"{r.aula}"</em>
                </span>
              </div>
              <span className={styles.recentTime}>
                <Icon name="clock" size={11} /> {r.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
