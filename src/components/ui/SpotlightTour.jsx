import { useEffect, useState, useCallback } from 'react'
import styles from './SpotlightTour.module.css'

export default function SpotlightTour({ steps, active, onFinish, storageKey }) {
  const [step,    setStep]    = useState(0)
  const [hl,      setHl]      = useState(null)   // highlight rect
  const [visible, setVisible] = useState(false)

  const current = steps[step]

  const measure = useCallback((delay = 320) => {
    if (!current?.target) return
    const el = document.querySelector(`[data-tour="${current.target}"]`)
    if (!el) { setHl(null); setVisible(true); return }
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      setHl({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 })
      setVisible(true)
    }, delay)
  }, [current?.target])

  useEffect(() => {
    if (!active) return
    setVisible(false)
    setHl(null)
    measure(step === 0 ? 500 : 280)
  }, [active, step, measure])

  useEffect(() => {
    if (!active) return
    const handler = () => measure(0)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [active, measure])

  if (!active) return null

  function next() {
    if (step < steps.length - 1) {
      setVisible(false)
      setTimeout(() => setStep(s => s + 1), 150)
    } else {
      finish()
    }
  }

  function prev() {
    setVisible(false)
    setTimeout(() => setStep(s => s - 1), 150)
  }

  function finish() {
    if (storageKey) {
      try { localStorage.setItem(storageKey, 'true') } catch {}
    }
    onFinish()
  }

  return (
    <div className={styles.root}>
      {/* Overlay escuro — não bloqueia cliques na área do highlight */}
      <div className={styles.overlay} onClick={finish} />

      {/* Highlight roxo no elemento */}
      {hl && (
        <div
          className={styles.highlight}
          style={{ top: hl.top, left: hl.left, width: hl.width, height: hl.height }}
        />
      )}

      {/* Tooltip fixo no canto inferior direito */}
      <div className={`${styles.tooltip} ${visible ? styles.visible : ''}`}>

        <div className={styles.head}>
          <span className={styles.badge}>{step + 1} / {steps.length}</span>
          <button className={styles.skip} onClick={finish}>Pular</button>
        </div>

        <h3 className={styles.title}>{current.title}</h3>
        <p className={styles.desc}>{current.description}</p>

        <div className={styles.nav}>
          {step > 0 && (
            <button className={styles.btnPrev} onClick={prev}>← Anterior</button>
          )}
          <button className={styles.btnNext} onClick={next}>
            {step < steps.length - 1 ? 'Próximo →' : 'Concluir ✓'}
          </button>
        </div>

        <div className={styles.dots}>
          {steps.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : i < step ? styles.dotDone : ''}`}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
