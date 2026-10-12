/**
 * Placeholder pages — one file, one component per route.
 * Replace each export with a real page when ready.
 */

function ComingSoon({ title, emoji = '🚧' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: 12,
      color: 'var(--text-secondary)', textAlign: 'center',
    }}>
      <span style={{ fontSize: 48 }}>{emoji}</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h2>
      <p style={{ margin: 0, fontSize: 14 }}>Em breve por aqui.</p>
    </div>
  )
}

// ── Student ──────────────────────────────────────────────────────────────────
export function SubjectsPage()  { return <ComingSoon title="Disciplinas"  emoji="📚" /> }
export function ProgressPage()  { return <ComingSoon title="Desempenho"   emoji="📊" /> }

// ── Teacher ──────────────────────────────────────────────────────────────────
export function TrilhasPage()   { return <ComingSoon title="Trilhas"      emoji="🏫" /> }
export function StudentsPage()   { return <ComingSoon title="Alunos"      emoji="👥" /> }
export function ActivitiesPage() { return <ComingSoon title="Atividades"  emoji="📝" /> }
export function ReportsPage()    { return <ComingSoon title="Relatórios"  emoji="📊" /> }
export function CalendarPage()   { return <ComingSoon title="Calendário"  emoji="📅" /> }

// ── Admin ────────────────────────────────────────────────────────────────────
export function UsersPage()   { return <ComingSoon title="Usuários"   emoji="👥" /> }
export function TicketsPage() { return <ComingSoon title="Tickets"    emoji="🚨" /> }

// ── Shared ───────────────────────────────────────────────────────────────────
export function SettingsPage() { return <ComingSoon title="Configurações" emoji="⚙️" /> }
