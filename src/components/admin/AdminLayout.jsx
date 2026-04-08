import AppLayout    from '../layout/AppLayout'
import AdminSidebar from './AdminSidebar'
import AdminHeader  from './AdminHeader'

export default function AdminLayout({ children }) {
  return (
    <AppLayout sidebar={AdminSidebar} header={AdminHeader} themeClass="adminTheme">
      {children}
    </AppLayout>
  )
}
