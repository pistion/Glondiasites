import { Link } from 'react-router-dom'
import SectionHeader from '../../../components/common/SectionHeader.jsx'
import StatusBadge from '../../../components/common/StatusBadge.jsx'
import { activeProject, launchChecklist } from '../../../data/dashboardMockData.js'

export default function DashboardPreview() {
  return (
    <section className="py-5 bg-light">
      <div className="container-xl">
        <SectionHeader
          description="The dashboard keeps pages, products, SEO, support, and launch preparation organized in one place."
          title="Manage Your Website Project in One Workspace"
        />
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-lg-5">
            <div className="row g-4 align-items-start">
              <div className="col-lg-5">
                <span className="text-uppercase text-success fw-semibold small">Project status</span>
                <h3 className="h4 mt-2">{activeProject.name}</h3>
                <p className="text-secondary">
                  {activeProject.businessName} is using the {activeProject.packageName} package with a launch target of {activeProject.launchTarget}.
                </p>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <StatusBadge value={activeProject.status} />
                  <StatusBadge value={activeProject.domain.status} />
                  <StatusBadge value={activeProject.hosting.deploymentStatus} />
                </div>
                <div className="progress mb-3" role="progressbar" aria-label="Project progress" aria-valuemax="100" aria-valuemin="0" aria-valuenow={activeProject.progress}>
                  <div className="progress-bar bg-success" style={{ width: `${activeProject.progress}%` }}>
                    {activeProject.progress}%
                  </div>
                </div>
                <Link className="btn btn-success" to="/dashboard">
                  Enter the dashboard
                </Link>
              </div>
              <div className="col-lg-7">
                <div className="row g-3">
                  {launchChecklist.slice(0, 6).map((item) => (
                    <div className="col-md-6" key={item.id}>
                      <div className="border rounded-3 bg-white p-3 h-100 d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <div className="fw-medium">{item.label}</div>
                          <div className="small text-secondary mt-1">Project workspace item</div>
                        </div>
                        <StatusBadge value={item.done ? 'Ready' : 'Needs review'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
