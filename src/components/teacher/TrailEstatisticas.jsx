import { useState, useEffect } from 'react'
import Icon from '../ui/Icon'
import { getEstatisticasTrilha } from '../../api/services/duvidaService'
import styles from './TrailEstatisticas.module.css'

export default function TrailEstatisticas({ trilhaId }) {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trilhaId) return
    getEstatisticasTrilha(trilhaId).then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [trilhaId])

  if (loading) return <div className={styles.container}><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando estatísticas...</p></div>
  if (!stats)  return <div className={styles.container}><p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Não foi possível carregar as estatísticas.</p></div>

  const metrics = [
    { icon: 'users',       label: 'Alunos matriculados', value: stats.totalAlunos,      positive: true,  delta: 'matrículas ativas'         },
    { icon: 'checkCircle', label: 'Aulas concluídas',    value: stats.totalConclusoes,  positive: true,  delta: `de ${stats.totalAulas} aulas` },
    { icon: 'alertCircle', label: 'Dúvidas enviadas',    value: stats.duvidasTotais,    positive: false, delta: `${stats.duvidasPendentes} pendentes` },
    { icon: 'activity',    label: 'Taxa de conclusão',   value: `${stats.taxaConclusao}%`, positive: true, delta: 'progresso médio' },
  ]

  return (
    <div className={styles.container}>

      <div className={styles.metricsGrid} data-tour="estatisticas-metrics">
        {metrics.map((m, i) => (
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

      {stats.aulaProgresso?.length > 0 && (
        <div className={styles.chartsRow}>
          <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
            <div className={styles.chartHeader}>
              <div>
                <h3 className={styles.chartTitle}>Progresso por aula</h3>
                <p className={styles.chartSub}>% de alunos que concluíram</p>
              </div>
            </div>
            <div className={styles.chartPlaceholder}>
              <div className={styles.fakeProgressList}>
                {stats.aulaProgresso.map((row, i) => (
                  <div key={i} className={styles.fakeProgressRow}>
                    <span className={styles.fakeProgressLabel}>{row.titulo}</span>
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
      )}

    </div>
  )
}
