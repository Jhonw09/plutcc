import AppHeader   from '../layout/AppHeader'
import Icon        from '../ui/Icon'
import adminStyles from './AdminHeader.module.css'

export default function AdminHeader({ onMenuOpen }) {
  return (
    <AppHeader
      subtitle="Painel administrativo"
      extraClass={adminStyles.header}
      onMenuOpen={onMenuOpen}
    />
  )
}
