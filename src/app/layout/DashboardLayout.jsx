import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.jsx'
import DashboardTopbar from '../../components/dashboard/DashboardTopbar.jsx'

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell d-flex">
      <aside className="dashboard-sidebar d-none d-lg-flex">
        <DashboardSidebar />
      </aside>

      <div
        aria-labelledby="dashboardSidebarLabel"
        className="offcanvas offcanvas-start dashboard-offcanvas d-lg-none"
        id="dashboardSidebarCanvas"
        tabIndex="-1"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="dashboardSidebarLabel">Menu</h5>
          <button aria-label="Close" className="btn-close" data-bs-dismiss="offcanvas" type="button" />
        </div>
        <div className="offcanvas-body p-0">
          <DashboardSidebar />
        </div>
      </div>

      <div className="dashboard-content flex-grow-1">
        <DashboardTopbar />
        <main className="dashboard-main container-fluid py-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
