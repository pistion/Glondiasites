import PageHeader from '../../components/common/PageHeader.jsx'
import DashboardCard from '../../components/dashboard/DashboardCard.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { analyticsCards, topPages, topProducts } from '../../data/dashboardMockData.js'

export default function AnalyticsPage() {
  const pageColumns = [
    { key: 'page', label: 'Top pages' },
    { key: 'views', label: 'Views' },
  ]

  const productColumns = [
    { key: 'product', label: 'Top products' },
    { key: 'views', label: 'Views' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Analytics" title="Website analytics overview" description="Review traffic, product interest, and channel performance in a workspace ready for live reporting data." />
      <div className="row g-3">
        {analyticsCards.map((card) => (
          <div className="col-md-6 col-xl-3" key={card.id}>
            <DashboardCard detail={card.detail} label={card.label} value={card.value} />
          </div>
        ))}
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-2">Traffic sources</h2>
              <p className="text-secondary small mb-3">Use these channels to understand how customers are finding the storefront.</p>
              <div className="d-grid gap-3">
                <div><div className="d-flex justify-content-between small mb-1"><span>Organic search</span><span>52%</span></div><div className="progress"><div className="progress-bar bg-success" style={{ width: '52%' }} /></div></div>
                <div><div className="d-flex justify-content-between small mb-1"><span>Direct</span><span>28%</span></div><div className="progress"><div className="progress-bar bg-success" style={{ width: '28%' }} /></div></div>
                <div><div className="d-flex justify-content-between small mb-1"><span>Referral</span><span>20%</span></div><div className="progress"><div className="progress-bar bg-success" style={{ width: '20%' }} /></div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Top pages</h2>
              <DashboardTable columns={pageColumns} rows={topPages} />
            </div>
          </div>
        </div>
      </div>
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <h2 className="h5 mb-3">Top products</h2>
          <DashboardTable columns={productColumns} rows={topProducts} />
        </div>
      </div>
    </div>
  )
}
