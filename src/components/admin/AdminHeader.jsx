import AppHeader   from '../layout/AppHeader'
import adminStyles from './AdminHeader.module.css'

export default function AdminHeader() {
  return (
    <AppHeader
      subtitle="Painel administrativo — visão geral da plataforma"
      emoji="🛡️"
      extraClass={adminStyles.header}
    />
  )
}
