import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { customersUiRows } from '../../data/dashboardMockData.js'

const profileTabs = ['Profile', 'Orders', 'Addresses', 'Notes']

export default function CustomersUiPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(customersUiRows[0])
  const [activeTab, setActiveTab] = useState('Profile')

  const columns = [
    { key: 'name', label: 'Customer', render: (row) => <button className="btn btn-link p-0 text-decoration-none" onClick={() => setSelectedCustomer(row)} type="button">{row.name}</button> },
    { key: 'email', label: 'Email' },
    { key: 'orders', label: 'Orders' },
    { key: 'totalSpent', label: 'Total spent' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'lastActivity', label: 'Last activity' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Customers UI" title="Prepare customer account and admin customer screens" description="Use this area to shape customer listings, profile views, account pages, and internal support notes." />
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm dashboard-panel">
            <div className="card-body p-4">
              <DashboardTable columns={columns} rows={customersUiRows} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-2">{selectedCustomer.name}</h2>
              <p className="text-secondary">{selectedCustomer.email}</p>
              <div className="nav nav-pills gap-2 mb-3">
                {profileTabs.map((tab) => (
                  <button className={`btn btn-sm ${activeTab === tab ? 'btn-success' : 'btn-outline-secondary'}`} key={tab} onClick={() => setActiveTab(tab)} type="button">
                    {tab}
                  </button>
                ))}
              </div>
              <div className="border rounded-3 p-3 bg-light">
                <div className="fw-medium mb-2">{activeTab}</div>
                <p className="text-secondary small mb-0">
                  {activeTab === 'Profile' ? 'Show profile details, tags, and account state.' : null}
                  {activeTab === 'Orders' ? 'Display past orders, totals, and status history.' : null}
                  {activeTab === 'Addresses' ? 'Keep shipping and billing addresses organized for customer account flows.' : null}
                  {activeTab === 'Notes' ? 'Store support notes and special handling instructions.' : null}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
