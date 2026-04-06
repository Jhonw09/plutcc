import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 → target when the returned ref enters the viewport.
 * @param {number} target
 * @param {number} threshold  IntersectionObserver threshold (0–1)
 * @returns {{ ref: React.RefObject, value: number }}
 */
export function useCountUp(target, threshold = 0.3) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()

        let current = 0
        const step = target / 60
        const timer = setInterval(() => {
          current += step
          if (current >= target) {
            setValue(target)
            clearInterval(timer)
          } else {
            setValue(Math.floor(current))
          }
        }, 16)
      },
      { threshold }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [target, threshold])

  return { ref, value }
}
