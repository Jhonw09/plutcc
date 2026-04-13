import AppHeader   from '../layout/AppHeader'
import Icon        from '../ui/Icon'
import adminStyles from './AdminHeader.module.css'

export default function AdminHeader() {
  return (
    <AppHeader
      subtitle="Painel administrativo — visão geral da plataforma"
      extraClass={adminStyles.header}
    />
  )
}
