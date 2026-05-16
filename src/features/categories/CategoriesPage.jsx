import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { productCategories as initialCategories } from '../../data/dashboardMockData.js'

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState('')

  const columns = [
    { key: 'name', label: 'Category' },
    { key: 'slug', label: 'Slug' },
    { key: 'count', label: 'Product count' },
    { key: 'featured', label: 'Featured', render: (row) => <StatusBadge value={row.featured === 'Yes' ? 'Active' : 'Draft'} /> },
    { key: 'seoStatus', label: 'SEO status', render: (row) => <StatusBadge value={row.seoStatus} /> },
    { key: 'actions', label: 'Actions', className: 'text-end', headerClassName: 'text-end', render: (row) => <button className="btn btn-sm btn-outline-success" onClick={() => setEditing(row)} type="button">Edit</button> },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Categories" title="Manage category structure" description="Organize product groups, featured collections, and search-friendly category metadata." actionLabel="Add category" onAction={() => setEditing({ id: null, name: '', slug: '', count: 0, featured: 'No', seoStatus: 'Draft' })} />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <DashboardTable columns={columns} rows={categories} />
        </div>
      </div>

      {editing ? (
        <div className="app-modal-backdrop">
          <div className="app-modal card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">{editing.id ? 'Edit category' : 'Add category'}</h2>
                <button className="btn-close" onClick={() => setEditing(null)} type="button" />
              </div>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Slug</label><input className="form-control" value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: event.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Featured</label><select className="form-select" value={editing.featured} onChange={(event) => setEditing({ ...editing, featured: event.target.value })}><option>Yes</option><option>No</option></select></div>
                <div className="col-md-6"><label className="form-label">SEO status</label><select className="form-select" value={editing.seoStatus} onChange={(event) => setEditing({ ...editing, seoStatus: event.target.value })}><option>Ready</option><option>Needs review</option><option>Draft</option></select></div>
                <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="3" defaultValue="Short description to explain what products belong in this category and how it should appear on the storefront." /></div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setEditing(null)} type="button">Cancel</button>
                <button className="btn btn-success" onClick={() => { setNotice(`${editing.id ? 'Updated' : 'Created'} ${editing.name || 'category'}.`); setEditing(null) }} type="button">Save category</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
