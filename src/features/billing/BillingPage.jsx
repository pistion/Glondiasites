import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { activeProject, billingRecords } from '../../data/dashboardMockData.js'

export default function BillingPage() {
  const [notice, setNotice] = useState('')

  const columns = [
    { key: 'id', label: 'Invoice number' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    {
      key: 'download',
      label: 'Download',
      className: 'text-end',
      headerClassName: 'text-end',
      render: () => <button className="btn btn-sm btn-outline-secondary" onClick={() => setNotice('Invoice export recorded locally.')} type="button">Download</button>,
    },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Billing" title="Plans, invoices, and billing contacts" description="Keep package scope, invoice history, payment details, and add-on requests visible in one place." />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="row g-4">
        <div className="col-lg-4 d-grid gap-4">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Current package</h2>
              <p className="mb-2"><strong>{activeProject.packageName}</strong></p>
              <p className="text-secondary">Includes dashboard access, storefront planning, and launch preparation workflow.</p>
              <button className="btn btn-success" onClick={() => setNotice('Package review request sent to the Glondia team.')} type="button">Manage package</button>
            </div>
          </div>
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Payment method</h2>
              <p className="mb-2"><strong>Visa ending 4242</strong></p>
              <p className="text-secondary small mb-3">Used for monthly hosting, approved add-ons, and ongoing support billing.</p>
              <ul className="list-unstyled mb-3 d-grid gap-2 small">
                <li><strong>Billing cycle:</strong> Monthly</li>
                <li><strong>Next invoice:</strong> 2026-06-01</li>
                <li><strong>Billing status:</strong> In good standing</li>
              </ul>
              <button className="btn btn-outline-secondary" onClick={() => setNotice('Payment method update request recorded locally.')} type="button">Update payment method</button>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Invoice history</h2>
              <DashboardTable columns={columns} rows={billingRecords} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Add-ons</h2>
              <div className="d-grid gap-3">
                <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center"><span>Additional product setup</span><button className="btn btn-sm btn-outline-success" onClick={() => setNotice('Add-on request added to the project queue.')} type="button">Request</button></div>
                <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center"><span>Extended support window</span><button className="btn btn-sm btn-outline-success" onClick={() => setNotice('Add-on request added to the project queue.')} type="button">Request</button></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Billing contact</h2>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" defaultValue="Sarah Kora" /></div>
                <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" defaultValue="billing@glondia.com" /></div>
                <div className="col-12"><button className="btn btn-outline-secondary" onClick={() => setNotice('Billing contact updated locally.')} type="button">Save contact</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
