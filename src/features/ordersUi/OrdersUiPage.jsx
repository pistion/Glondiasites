import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { ordersUiRows } from '../../data/dashboardMockData.js'

export default function OrdersUiPage() {
  const columns = [
    { key: 'id', label: 'Order number' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total' },
    { key: 'paymentStatus', label: 'Payment status', render: (row) => <StatusBadge value={row.paymentStatus} /> },
    { key: 'fulfillmentStatus', label: 'Fulfillment status', render: (row) => <StatusBadge value={row.fulfillmentStatus} /> },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Orders UI" title="Prepare order management screens" description="Shape order lists, status badges, detail panels, and empty states before live order data is connected." />
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm dashboard-panel">
            <div className="card-body p-4">
              <DashboardTable columns={columns} rows={ordersUiRows} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5">Order detail layout</h2>
              <p className="text-secondary">Use the final order detail view to present payment state, fulfillment progress, customer notes, and service actions.</p>
              <div className="border rounded-3 p-3">
                <div className="fw-medium mb-2">Recommended detail blocks</div>
                <ul className="small text-secondary mb-0 ps-3">
                  <li>Order header and status badges</li>
                  <li>Customer summary</li>
                  <li>Line items table</li>
                  <li>Refund and cancel request states</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
