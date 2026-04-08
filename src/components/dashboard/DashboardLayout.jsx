import AppLayout        from '../layout/AppLayout'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader  from './DashboardHeader'

export default function DashboardLayout({ children }) {
  return (
    <AppLayout sidebar={DashboardSidebar} header={DashboardHeader}>
      {children}
    </AppLayout>
  )
}
