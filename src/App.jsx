import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage                from './pages/LandingPage'
import DashboardPage             from './components/dashboard/DashboardPage'
import TeacherDashboardPage      from './pages/TeacherDashboardPage'
import TeacherMinhasTrilhasPage  from './pages/TeacherMinhasTrilhasPage'
import TeacherTrilhaPage         from './pages/TeacherTrilhaPage'
import TeacherRelatoriosPage     from './pages/TeacherRelatoriosPage'
import TeacherConfiguracoesPage  from './pages/TeacherConfiguracoesPage'
import AdminDashboardPage        from './pages/AdminDashboardPage'
import TrilhaPage                from './pages/TrilhaPage'
import StudentTrilhaPage         from './pages/StudentTrilhaPage'
import ProtectedRoute            from './components/ProtectedRoute'
import {
  SubjectsPage, ExercisesPage, ExamsPage, GoalsPage,
  UsersPage, SchoolsPage, FinancePage, TicketsPage, AdminReportsPage,
  SettingsPage, HelpPage,
} from './pages/placeholders'

import BlogPage          from './pages/BlogPage'
import ExplorarTrilhas   from './pages/ExplorarTrilhas'
import MinhasTrilhasPage from './pages/MinhasTrilhasPage'
import MinhasDuvidasPage from './pages/MinhasDuvidasPage'
import DesempenhoPage    from './pages/DesempenhoPage'
import TrilhaDetalhePage from './pages/TrilhaDetalhePage'
import './App.css'

function S({ children }) {
  return <ProtectedRoute role="student">{children}</ProtectedRoute>
}
function T({ children }) {
  return <ProtectedRoute role="teacher">{children}</ProtectedRoute>
}
function A({ children }) {
  return <ProtectedRoute role="admin">{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage key="landing" />} />
      <Route path="/cadastro" element={<LandingPage key="cadastro" initialAuth="signup" />} />

      {/* ── Student ── */}
      <Route path="/dashboard"                  element={<S><DashboardPage /></S>} />
      <Route path="/dashboard/trilhas"           element={<S><MinhasTrilhasPage /></S>} />
      <Route path="/dashboard/trilha-detalhe/:id" element={<S><TrilhaDetalhePage /></S>} />
      <Route path="/dashboard/desempenho"        element={<S><DesempenhoPage /></S>} />
      <Route path="/dashboard/duvidas"            element={<S><MinhasDuvidasPage /></S>} />
      <Route path="/dashboard/disciplinas"       element={<S><SubjectsPage /></S>} />
      <Route path="/dashboard/exercicios"        element={<S><ExercisesPage /></S>} />
      <Route path="/dashboard/simulados"         element={<S><ExamsPage /></S>} />
      <Route path="/dashboard/metas"             element={<S><GoalsPage /></S>} />
      <Route path="/dashboard/configuracoes"     element={<S><SettingsPage /></S>} />
      <Route path="/dashboard/ajuda"             element={<S><HelpPage /></S>} />
      <Route path="/dashboard/trilha/:id"         element={<S><StudentTrilhaPage /></S>} />

      {/* ── Teacher ── */}
      <Route path="/teacher-dashboard"             element={<T><TeacherDashboardPage /></T>} />
      <Route path="/teacher-dashboard/trilhas"      element={<T><TeacherMinhasTrilhasPage /></T>} />
      <Route path="/teacher-dashboard/relatorios"   element={<T><TeacherRelatoriosPage /></T>} />
      <Route path="/teacher-dashboard/configuracoes" element={<T><TeacherConfiguracoesPage /></T>} />
      <Route path="/professor/trilha/:id"           element={<T><TeacherTrilhaPage /></T>} />

      {/* ── Admin ── */}
      <Route path="/admin"                  element={<A><AdminDashboardPage /></A>} />
      <Route path="/admin/usuarios"         element={<A><UsersPage /></A>} />
      <Route path="/admin/escolas"          element={<A><SchoolsPage /></A>} />
      <Route path="/admin/financeiro"       element={<A><FinancePage /></A>} />
      <Route path="/admin/relatorios"       element={<A><AdminReportsPage /></A>} />
      <Route path="/admin/tickets"          element={<A><TicketsPage /></A>} />
      <Route path="/admin/configuracoes"    element={<A><SettingsPage /></A>} />
      <Route path="/admin/ajuda"            element={<A><HelpPage /></A>} />

      <Route path="/sobre" element={<BlogPage />} />
      <Route path="/explorar" element={<S><ExplorarTrilhas /></S>} />

      {/* ── Catch-all */}
      <Route path="/trilha/:id" element={<ProtectedRoute><TrilhaPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
