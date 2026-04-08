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
export function ExercisesPage() { return <ComingSoon title="Exercícios"   emoji="📝" /> }
export function ExamsPage()     { return <ComingSoon title="Simulados"    emoji="📋" /> }
export function ProgressPage()  { return <ComingSoon title="Desempenho"   emoji="📊" /> }
export function GoalsPage()     { return <ComingSoon title="Metas"        emoji="🎯" /> }

// ── Teacher ──────────────────────────────────────────────────────────────────
export function ClassesPage()    { return <ComingSoon title="Turmas"      emoji="🏫" /> }
export function StudentsPage()   { return <ComingSoon title="Alunos"      emoji="👥" /> }
export function ActivitiesPage() { return <ComingSoon title="Atividades"  emoji="📝" /> }
export function ReportsPage()    { return <ComingSoon title="Relatórios"  emoji="📊" /> }
export function CalendarPage()   { return <ComingSoon title="Calendário"  emoji="📅" /> }

// ── Admin ────────────────────────────────────────────────────────────────────
export function UsersPage()   { return <ComingSoon title="Usuários"   emoji="👥" /> }
export function SchoolsPage() { return <ComingSoon title="Escolas"    emoji="🏫" /> }
export function FinancePage() { return <ComingSoon title="Financeiro" emoji="💰" /> }
export function TicketsPage() { return <ComingSoon title="Tickets"    emoji="🚨" /> }

// ── Shared ───────────────────────────────────────────────────────────────────
export function SettingsPage() { return <ComingSoon title="Configurações" emoji="⚙️" /> }
export function HelpPage()     { return <ComingSoon title="Ajuda"         emoji="❓" /> }
// Admin reuses the same Reports component as teacher for now
export { ReportsPage as AdminReportsPage }
