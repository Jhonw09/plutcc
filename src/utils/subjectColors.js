/**
 * Badge styles derived entirely from the site's existing CSS custom properties.
 *
 * Design decisions:
 * - Subject/level badges: text is always var(--text-secondary) so they never
 *   compete with interactive elements. The border provides the per-subject hue.
 *   Border colors are drawn from the same token set used elsewhere in the UI
 *   (accent, success, danger, text-secondary) — no new colors introduced.
 * - Type badges: use the semantic success/muted tokens already used for
 *   status indicators throughout the app.
 * - Background: always transparent — the border is the sole color signal.
 */

// Border-color token per subject/level key.
// Every value is a CSS custom property already defined in index.css :root,
// or a minimal hex that maps to a Tailwind-equivalent already present in the UI.
const BORDER_TOKEN = {
  // Subjects
  Matemática:  'var(--accent)',           // purple — site accent
  Física:      'var(--success)',          // green
  Química:     'var(--accent-border)',    // muted purple
  Biologia:    'var(--success)',          // green (reuse)
  Português:   'var(--text-secondary)',   // neutral
  História:    'var(--danger)',           // red
  Geografia:   'var(--text-secondary)',   // neutral
  Inglês:      'var(--text-secondary)',   // neutral
  Artes:       'var(--text-secondary)',   // neutral
  Informática: 'var(--accent)',           // purple (reuse)
  Filosofia:   'var(--text-muted)',       // very muted
  Sociologia:  'var(--text-muted)',       // very muted

  // Education levels
  Fundamental: 'var(--text-secondary)',   // neutral
  Médio:       'var(--text-secondary)',   // neutral
  Vestibular:  'var(--text-secondary)',   // neutral

  // Class type — semantic meaning matters here
  PUBLICA:     'var(--success)',          // green = open
  PRIVADA:     'var(--text-muted)',       // muted = closed
}

const FALLBACK_BORDER = 'var(--border)'

/**
 * Returns a complete inline style object for a subject/level badge.
 * Text is always var(--text-secondary); only the border carries the hue.
 *
 * @param {string} key - Subject, level, or type key
 * @returns {React.CSSProperties}
 */
export function tagStyle(key) {
  const border = BORDER_TOKEN[key] ?? FALLBACK_BORDER
  const isType = key === 'PUBLICA' || key === 'PRIVADA'
  return {
    borderColor:     border,
    color:           isType ? border : 'var(--text-secondary)',
    backgroundColor: 'transparent',
  }
}

/**
 * Returns a filled-background style for the type badge (Pública/Privada).
 * Uses a soft tint of the semantic color so it reads as a status chip.
 * Pública → soft green tint   Privada → soft red tint
 *
 * @param {'PUBLICA'|'PRIVADA'} tipo
 * @returns {React.CSSProperties}
 */
export function typeBadgeStyle(tipo) {
  if (tipo === 'PUBLICA') {
    return {
      color:           'var(--success)',
      borderColor:     'rgba(34,197,94,0.35)',
      backgroundColor: 'rgba(34,197,94,0.08)',
    }
  }
  return {
    color:           'var(--danger)',
    borderColor:     'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  }
}

/**
 * Legacy exports kept so existing callers don't break.
 * subjectColor and subjectTint are no longer used for badges
 * but may still be imported in some files.
 */
export function subjectColor(disciplina, nivel) {
  return BORDER_TOKEN[disciplina] ?? BORDER_TOKEN[nivel] ?? FALLBACK_BORDER
}

export function subjectTint() {
  return 'var(--surface-2)'
}
