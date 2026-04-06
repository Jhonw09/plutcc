/**
 * Circular avatar showing a single initial letter with a tinted background.
 *
 * @param {string} initial
 * @param {string} bg       - CSS color for background (e.g. 'rgba(108,92,231,0.15)')
 * @param {string} color    - CSS color for text
 * @param {number} size     - Diameter in px (default 40)
 */
export function Avatar({ initial, bg, color, size = 40 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: color,
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  )
}
