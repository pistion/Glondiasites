import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { activeProject, buildHistory } from '../../data/dashboardMockData.js'

export default function HostingPage() {
  const [notice, setNotice] = useState('')

  const columns = [
    { key: 'environment', label: 'Environment' },
    { key: 'status', label: 'Build status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'createdAt', label: 'Created at' },
    { key: 'duration', label: 'Duration' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Hosting" title="Hosting and deployment status" description="Review environment controls, deployment history, and launch-readiness details for the storefront." actionLabel="Deploy preview" onAction={() => setNotice('Preview deployment requested in this workspace.')} />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="row g-3">
        <div className="col-md-6 col-xl-3"><DashboardCard label="Plan" value={activeProject.hosting.plan} detail="Current hosting package" /></div>
        <div className="col-md-6 col-xl-3"><DashboardCard label="Environment" value={activeProject.hosting.environment} detail="Active deployment target" /></div>
        <div className="col-md-6 col-xl-3"><DashboardCard label="SSL status" value={activeProject.domain.sslStatus} detail="Security readiness" /></div>
        <div className="col-md-6 col-xl-3"><DashboardCard label="Storage usage" value={activeProject.hosting.storageUsage} detail="Current usage snapshot" /></div>
      </div>

      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="row g-3 mb-4">
            <div className="col-md-4"><label className="form-label">Environment selector</label><select className="form-select" defaultValue={activeProject.hosting.environment}><option>Staging</option><option>Preview</option><option>Production</option></select></div>
            <div className="col-md-4"><label className="form-label">Region and CDN</label><input className="form-control" defaultValue={activeProject.hosting.region} /></div>
            <div className="col-md-4"><label className="form-label">Bandwidth usage</label><input className="form-control" defaultValue={activeProject.hosting.bandwidthUsage} /></div>
          </div>
          <DashboardTable columns={columns} rows={buildHistory} />
        </div>
      </div>
    </div>
  )
}
