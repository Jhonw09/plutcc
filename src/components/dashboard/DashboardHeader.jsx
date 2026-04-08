import AppHeader from '../layout/AppHeader'

export default function DashboardHeader({ onMenuOpen }) {
  return <AppHeader subtitle="Veja o que você tem pra hoje" showSearch onMenuOpen={onMenuOpen} />
}
