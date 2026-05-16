import { Outlet } from 'react-router-dom'
import PublicNavbar from '../../components/public/PublicNavbar.jsx'
import PublicFooter from '../../components/public/PublicFooter.jsx'

export default function PublicLayout() {
  return (
    <div className="public-shell d-flex min-vh-100 flex-column">
      <PublicNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
