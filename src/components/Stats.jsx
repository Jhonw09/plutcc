import { useEffect, useRef, useState } from 'react'
import styles from './Stats.module.css'

const stats = [
  { value: 5000000, label: 'Alunos ativos', suffix: '+', format: n => (n/1e6).toFixed(1)+'M' },
  { value: 20000,   label: 'Escolas parceiras', suffix: '+', format: n => (n/1e3).toFixed(0)+'K' },
  { value: 500000,  label: 'Questões no banco', suffix: '+', format: n => (n/1e3).toFixed(0)+'K' },
  { value: 10000,   label: 'Videoaulas', suffix: '+', format: n => (n/1e3).toFixed(0)+'K' },
]

function useCounter(target, active) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target])
  return val
}

function StatItem({ stat }) {
  const ref = useRef()
  const [active, setActive] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true) }, { threshold: .3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const val = useCounter(stat.value, active)
  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.statValue}>{stat.format(val)}<span className={styles.suffix}>{stat.suffix}</span></div>
      <div className={styles.statLabel}>{stat.label}</div>
    </div>
  )
}

export default function Stats() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {stats.map((s, i) => <StatItem key={i} stat={s} />)}
        </div>
      </div>
    </section>
  )
}
