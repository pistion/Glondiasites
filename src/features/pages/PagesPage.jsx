import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { ecommercePages } from '../../data/dashboardMockData.js'

export default function PagesPage() {
  const [selectedPage, setSelectedPage] = useState(ecommercePages[0])
  const [saved, setSaved] = useState(false)

  const columns = [
    { key: 'title', label: 'Page title', render: (row) => <button className="btn btn-link p-0 text-decoration-none" onClick={() => setSelectedPage(row)} type="button">{row.title}</button> },
    { key: 'slug', label: 'Slug' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'seoStatus', label: 'SEO status', render: (row) => <StatusBadge value={row.seoStatus} /> },
    { key: 'updatedAt', label: 'Last updated' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Pages" title="Manage website pages" description="Edit content pages, commerce templates, and support pages from one structured list." actionLabel="Save editor changes" onAction={() => setSaved(true)} />
      {saved ? <div className="alert alert-success">Page content saved locally in this workspace.</div> : null}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm dashboard-panel">
            <div className="card-body p-4">
              <DashboardTable columns={columns} rows={ecommercePages} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Page editor: {selectedPage.title}</h2>
              <div className="row g-3" key={selectedPage.id}>
                <div className="col-12"><label className="form-label">Page title</label><input className="form-control" defaultValue={selectedPage.title} /></div>
                <div className="col-12"><label className="form-label">Slug</label><input className="form-control" defaultValue={selectedPage.slug} /></div>
                <div className="col-12"><label className="form-label">Hero title</label><input className="form-control" defaultValue={`${selectedPage.title} page headline`} /></div>
                <div className="col-12"><label className="form-label">Body content</label><textarea className="form-control" rows="6" defaultValue={`Draft content for the ${selectedPage.title.toLowerCase()} page, including the core ecommerce message, key sections, and support details.`} /></div>
                <div className="col-12"><label className="form-label">SEO title</label><input className="form-control" defaultValue={`${selectedPage.title} | Glondia`} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
