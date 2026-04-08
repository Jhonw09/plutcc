/**
 * Centralised color palette for subject, level, and type badges.
 *
 * Each subject entry defines three values that together produce a
 * "soft tint" badge: a semi-transparent background, a slightly more
 * opaque border, and a readable foreground text color.
 * All raw values are plain CSS — no custom properties — so they work
 * as inline styles without depending on :root token availability.
 *
 * Level badges intentionally use softer, lower-saturation tones so
 * they never compete visually with the subject badge on the same row.
 *
 * Type badges (PUBLICA / PRIVADA) use semantic green / red.
 */

// ── Subject palette ───────────────────────────────────────────────────────
// Each entry: [background, border, color]
const SUBJECT_PALETTE = {
  Matemática:  ['rgba(239,68,68,0.10)',   'rgba(239,68,68,0.30)',   '#f87171'],  // red
  Física:      ['rgba(59,130,246,0.10)',  'rgba(59,130,246,0.30)',  '#60a5fa'],  // blue
  Química:     ['rgba(34,197,94,0.10)',   'rgba(34,197,94,0.30)',   '#4ade80'],  // green
  Biologia:    ['rgba(16,185,129,0.10)',  'rgba(16,185,129,0.30)',  '#34d399'],  // emerald
  Português:   ['rgba(249,115,22,0.10)',  'rgba(249,115,22,0.30)',  '#fb923c'],  // orange
  História:    ['rgba(239,68,68,0.10)',   'rgba(239,68,68,0.30)',   '#f87171'],  // red
  Geografia:   ['rgba(20,184,166,0.10)',  'rgba(20,184,166,0.30)',  '#2dd4bf'],  // teal
  Inglês:      ['rgba(99,102,241,0.10)',  'rgba(99,102,241,0.30)',  '#818cf8'],  // indigo
  Artes:       ['rgba(236,72,153,0.10)',  'rgba(236,72,153,0.30)',  '#f472b6'],  // pink
  Informática: ['rgba(6,182,212,0.10)',   'rgba(6,182,212,0.30)',   '#22d3ee'],  // cyan
  Filosofia:   ['rgba(168,85,247,0.10)',  'rgba(168,85,247,0.30)',  '#c084fc'],  // violet
  Sociologia:  ['rgba(245,158,11,0.10)',  'rgba(245,158,11,0.30)',  '#fbbf24'],  // amber
}

// ── Level palette — softer, neutral-leaning tones ─────────────────────────
const LEVEL_PALETTE = {
  Fundamental: ['rgba(148,163,184,0.10)', 'rgba(148,163,184,0.28)', '#94a3b8'],  // slate
  Médio:       ['rgba(100,116,139,0.10)', 'rgba(100,116,139,0.28)', '#64748b'],  // slate-500
  Vestibular:  ['rgba(251,191,36,0.10)',  'rgba(251,191,36,0.28)',  '#fbbf24'],  // amber — signals importance
}

const FALLBACK = ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.12)', '#a1a1aa']

/**
 * Returns a filled-background inline style for a subject or level badge.
 * Automatically detects whether the key is a subject or a level.
 *
 * @param {string} key - e.g. 'Matemática', 'Médio'
 * @returns {React.CSSProperties}
 */
export function tagStyle(key) {
  const [bg, border, color] =
    SUBJECT_PALETTE[key] ?? LEVEL_PALETTE[key] ?? FALLBACK
  return { backgroundColor: bg, borderColor: border, color }
}

/**
 * Returns a filled-background style for the type badge (Pública/Privada).
 *
 * @param {'PUBLICA'|'PRIVADA'} tipo
 * @returns {React.CSSProperties}
 */
export function typeBadgeStyle(tipo) {
  if (tipo === 'PUBLICA') {
    return {
      color:           '#4ade80',
      borderColor:     'rgba(34,197,94,0.35)',
      backgroundColor: 'rgba(34,197,94,0.08)',
    }
  }
  return {
    color:           '#f87171',
    borderColor:     'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  }
}

// ── Legacy exports — kept so existing callers don't break ─────────────────
export function subjectColor(disciplina, nivel) {
  const entry = SUBJECT_PALETTE[disciplina] ?? LEVEL_PALETTE[nivel]
  return entry ? entry[2] : '#a1a1aa'
}

export function subjectTint() {
  return 'var(--surface-2)'
}
