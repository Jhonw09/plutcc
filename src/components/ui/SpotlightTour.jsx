import { useEffect, useState, useCallback, useRef } from 'react'
import styles from './SpotlightTour.module.css'

export default function SpotlightTour({ steps, active, onFinish, storageKey, onStep }) {
  const [step,      setStep]      = useState(0)
  const [hl,        setHl]        = useState(null)
  const [visible,   setVisible]   = useState(false)
  const [direction, setDirection] = useState('next')
  const rafRef      = useRef(null)
  const hlRef       = useRef(null)   // último hl medido, para comparar sem re-render
  const stepRef     = useRef(step)

  useEffect(() => { stepRef.current = step }, [step])

  const current = steps[step]

  // ── Bloqueia scroll do body enquanto o tour está ativo ──────────────────
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [active])

  // ── rAF loop: re-mede o elemento a cada frame ───────────────────────────
  const startTracking = useCallback((target) => {
    cancelAnimationFrame(rafRef.current)

    function tick() {
      const el = document.querySelector(`[data-tour="${target}"]`)
      if (!el) { rafRef.current = requestAnimationFrame(tick); return }

      const r = el.getBoundingClientRect()
      const next = { top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 }

      // só atualiza state se mudou (evita re-renders desnecessários)
      const prev = hlRef.current
      if (!prev || prev.top !== next.top || prev.left !== next.left ||
          prev.width !== next.width || prev.height !== next.height) {
        hlRef.current = next
        setHl(next)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Ao mudar de step: esconde tooltip, espera DOM, começa tracking ───────
  useEffect(() => {
    if (!active) return
    setVisible(false)
    setHl(null)
    hlRef.current = null
    cancelAnimationFrame(rafRef.current)

    const delay = step === 0 ? 500 : 250
    const t = setTimeout(() => {
      if (current?.target) {
        startTracking(current.target)
        // mostra tooltip após primeiro frame medido
        setTimeout(() => setVisible(true), 120)
      } else {
        setVisible(true)
      }
    }, delay)

    return () => { clearTimeout(t); cancelAnimationFrame(rafRef.current) }
  }, [active, step]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null

  function goTo(nextIdx, dir) {
    setDirection(dir)
    setVisible(false)
    setHl(null)
    hlRef.current = null
    cancelAnimationFrame(rafRef.current)
    onStep?.(steps[nextIdx])
    setTimeout(() => setStep(nextIdx), 200)
  }

  function next() {
    if (step < steps.length - 1) goTo(step + 1, 'next')
    else finish()
  }

  function prev() {
    if (step > 0) goTo(step - 1, 'prev')
  }

  function finish() {
    cancelAnimationFrame(rafRef.current)
    if (storageKey) { try { localStorage.setItem(storageKey, 'true') } catch {} }
    onFinish()
  }

  function tooltipStyle() {
    if (!hl) return { bottom: 28, right: 28 }
    const TOOLTIP_H = 210
    const TOOLTIP_W = 310
    const below     = hl.top + hl.height + 14
    const fitsBelow = below + TOOLTIP_H < window.innerHeight
    const left      = Math.max(16, Math.min(hl.left, window.innerWidth - TOOLTIP_W - 16))
    return fitsBelow
      ? { top: below, left }
      : { top: Math.max(8, hl.top - TOOLTIP_H - 14), left }
  }

  const tabLabel = current.tab
    ? { aulas: 'Aulas', duvidas: 'Dúvidas', estatisticas: 'Estatísticas', configuracoes: 'Configurações' }[current.tab]
    : null

  return (
    <div className={styles.root}>
      {/* overlay sempre presente — buraco via clip-path animado */}
      <div
        className={styles.overlay}
        style={hl ? {
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% ${hl.top}px,
            ${hl.left}px ${hl.top}px,
            ${hl.left}px ${hl.top + hl.height}px,
            ${hl.left + hl.width}px ${hl.top + hl.height}px,
            ${hl.left + hl.width}px ${hl.top}px,
            0% ${hl.top}px
          )`
        } : undefined}
      />

      {hl && (
        <div
          className={styles.highlight}
          style={{ top: hl.top, left: hl.left, width: hl.width, height: hl.height }}
        />
      )}

      <div
        className={`${styles.tooltip} ${visible ? styles.visible : ''} ${styles[direction]}`}
        style={tooltipStyle()}
      >
        <div className={styles.head}>
          <div className={styles.headLeft}>
            {tabLabel && <span className={styles.tabPill}>{tabLabel}</span>}
            <span className={styles.badge}>{step + 1} / {steps.length}</span>
          </div>
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
