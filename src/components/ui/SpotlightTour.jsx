import { useEffect, useState, useCallback, useRef } from 'react'
import styles from './SpotlightTour.module.css'

function getScrollParent(el) {
  if (!el) return window
  const style = getComputedStyle(el)
  if (['auto', 'scroll'].includes(style.overflowY) && el.scrollHeight > el.clientHeight) return el
  return getScrollParent(el.parentElement)
}

export default function SpotlightTour({ steps, active, onFinish, storageKey }) {
  const [step,    setStep]    = useState(0)
  const [hl,      setHl]      = useState(null)
  const [visible, setVisible] = useState(false)
  const scrollParentRef       = useRef(null)

  const current = steps[step]

  const measure = useCallback(() => {
    if (!current?.target) return
    const el = document.querySelector(`[data-tour="${current.target}"]`)
    if (!el) { setHl(null); setVisible(true); return }

    // scroll o elemento pra view
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // guarda o scroll parent pra escutar depois
    scrollParentRef.current = getScrollParent(el)

    // espera o scroll terminar antes de medir
    let settled
    function onScroll() {
      clearTimeout(settled)
      settled = setTimeout(snap, 80)
    }
    function snap() {
      scrollParentRef.current?.removeEventListener('scroll', onScroll)
      const r = el.getBoundingClientRect()
      setHl({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 })
      setVisible(true)
    }

    scrollParentRef.current?.addEventListener('scroll', onScroll, { passive: true })
    // fallback: se não houver scroll, mede direto após um tick
    settled = setTimeout(snap, 350)
  }, [current?.target])

  useEffect(() => {
    if (!active) return
    setVisible(false)
    setHl(null)
    // pequeno delay inicial pra garantir que o DOM está pintado
    const t = setTimeout(measure, step === 0 ? 500 : 200)
    return () => clearTimeout(t)
  }, [active, step, measure])

  // recalcula no resize
  useEffect(() => {
    if (!active) return
    function onResize() { setVisible(false); setHl(null); setTimeout(measure, 100) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
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

  function tooltipStyle() {
    if (!hl) return { bottom: 28, right: 28 }
    const TOOLTIP_H = 190
    const TOOLTIP_W = 300
    const below     = hl.top + hl.height + 14
    const fitsBelow = below + TOOLTIP_H < window.innerHeight
    const left      = Math.max(16, Math.min(hl.left, window.innerWidth - TOOLTIP_W - 16))
    return fitsBelow
      ? { top: below, left }
      : { top: Math.max(8, hl.top - TOOLTIP_H - 14), left }
  }

  return (
    <div className={styles.root}>
      {hl ? (
        <svg className={styles.overlaySvg} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="spot-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={hl.left} y={hl.top} width={hl.width} height={hl.height} rx="12" fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#spot-mask)" />
        </svg>
      ) : (
        <div className={styles.overlay} onClick={finish} />
      )}

      {hl && (
        <div
          className={styles.highlight}
          style={{ top: hl.top, left: hl.left, width: hl.width, height: hl.height }}
        />
      )}

      <div
        className={`${styles.tooltip} ${visible ? styles.visible : ''}`}
        style={tooltipStyle()}
      >
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
