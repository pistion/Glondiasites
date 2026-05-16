import { ArrowRight, FolderPlus, MessageSquarePlus, SearchCheck, UserRoundPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader.jsx'
import SectionHeader from '../../components/common/SectionHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'
import { activeProject, launchChecklist, recentActivity, tickets, ecommercePages, products } from '../../data/dashboardMockData.js'

export default function DashboardOverview() {
  return (
    <div className="d-grid gap-4">
      <PageHeader
        eyebrow="Dashboard overview"
        title={activeProject.name}
        description={`${activeProject.businessName} is currently ${activeProject.status.toLowerCase()} with a ${activeProject.launchTarget} launch target.`}
      />

      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
            <div>
              <div className="text-secondary small text-uppercase fw-semibold mb-2">Project summary</div>
              <h2 className="h4 mb-1">{activeProject.businessName}</h2>
              <p className="text-secondary mb-3">Package: {activeProject.packageName}</p>
              <div className="d-flex flex-wrap gap-2">
                <StatusBadge value={activeProject.status} />
                <StatusBadge value={activeProject.domain.status} />
                <StatusBadge value={activeProject.hosting.deploymentStatus} />
              </div>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2 align-items-start">
              <Link className="btn btn-outline-success" to="/dashboard/storefront">Preview website</Link>
              <Link className="btn btn-success" to="/dashboard/messages">Request update</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6 col-xl-3">
          <DashboardCard detail="Current completion level" label="Project progress" value={`${activeProject.progress}%`} />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard detail="Pages in the workspace" label="Pages completed" value={ecommercePages.filter((page) => page.status === 'Ready').length} />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard detail="Products drafted or active" label="Products prepared" value={products.length} />
        </div>
        <div className="col-md-6 col-xl-3">
          <DashboardCard detail="Support items to resolve" label="Open tickets" value={tickets.filter((ticket) => ticket.status !== 'Closed').length} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <SectionHeader title="Launch checklist" description="Track core project milestones before launch." />
              <div className="list-group list-group-flush">
                {launchChecklist.map((item) => (
                  <div className="list-group-item px-0 d-flex justify-content-between align-items-center" key={item.id}>
                    <span>{item.label}</span>
                    <StatusBadge value={item.done ? 'Ready' : 'Needs review'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <SectionHeader title="Recent activity" description="Latest project actions and updates." />
              <div className="d-grid gap-3">
                {recentActivity.map((activity) => (
                  <div className="border rounded-3 p-3" key={activity.id}>
                    <div className="fw-medium">{activity.item}</div>
                    <div className="small text-secondary">{activity.actor} - {activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <SectionHeader title="Quick actions" description="Jump into the most common project tasks." />
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-outline-secondary" to="/dashboard/products"><FolderPlus className="me-2" size={16} />Add product</Link>
            <Link className="btn btn-outline-secondary" to="/dashboard/pages"><SearchCheck className="me-2" size={16} />Edit homepage</Link>
            <Link className="btn btn-outline-secondary" to="/dashboard/tickets"><MessageSquarePlus className="me-2" size={16} />Open ticket</Link>
            <Link className="btn btn-outline-secondary" to="/dashboard/account"><UserRoundPen className="me-2" size={16} />Update account</Link>
            <Link className="btn btn-outline-secondary" to="/dashboard/seo">Review SEO <ArrowRight className="ms-2" size={16} /></Link>
          </div>
        </div>
      </div>
    </div>
  )
}
