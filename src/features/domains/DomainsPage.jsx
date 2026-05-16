import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { activeProject, connectedDomains, dnsRecords } from '../../data/dashboardMockData.js'

export default function DomainsPage() {
  const [notice, setNotice] = useState('')

  const domainColumns = [
    { key: 'domain', label: 'Domain' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'sslStatus', label: 'SSL status', render: (row) => <StatusBadge value={row.sslStatus} /> },
    { key: 'renewalDate', label: 'Renewal' },
  ]

  const dnsColumns = [
    { key: 'type', label: 'Type' },
    { key: 'host', label: 'Host' },
    { key: 'value', label: 'Value' },
    { key: 'ttl', label: 'TTL' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Domains" title="Manage domains and DNS records" description="Track primary domains, connection status, SSL readiness, and the DNS records needed for launch." />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm dashboard-panel">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Primary domain</h2>
              <ul className="list-unstyled mb-3 d-grid gap-2">
                <li><strong>Preferred:</strong> {activeProject.domain.preferred}</li>
                <li><strong>Primary:</strong> {activeProject.domain.primary}</li>
                <li><strong>Status:</strong> <StatusBadge value={activeProject.domain.status} /></li>
                <li><strong>SSL:</strong> <StatusBadge value={activeProject.domain.sslStatus} /></li>
              </ul>
              <label className="form-label" htmlFor="domainSearch">Domain lookup</label>
              <div className="input-group">
                <input className="form-control" id="domainSearch" placeholder="Search for a domain" />
                <button className="btn btn-success" onClick={() => setNotice('Domain lookup request saved for the project team.')} type="button">Search</button>
              </div>
              <p className="small text-secondary mt-2 mb-0">Use this to collect preferred domains before final registration and DNS connection.</p>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Connected domains</h2>
              <DashboardTable columns={domainColumns} rows={connectedDomains} />
            </div>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <h2 className="h5 mb-2">DNS records</h2>
          <p className="text-secondary small mb-3">Share or confirm these records when the production domain is being connected.</p>
          <DashboardTable columns={dnsColumns} rows={dnsRecords} />
        </div>
      </div>
    </div>
  )
}
