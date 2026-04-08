import AppLayout       from '../layout/AppLayout'
import TeacherSidebar  from './TeacherSidebar'
import DashboardHeader from '../dashboard/DashboardHeader'

export default function TeacherLayout({ children }) {
  return (
    <AppLayout sidebar={TeacherSidebar} header={DashboardHeader}>
      {children}
    </AppLayout>
  )
}
