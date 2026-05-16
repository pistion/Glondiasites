import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { productCategories, products as initialProducts } from '../../data/dashboardMockData.js'

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts)
  const [editingProduct, setEditingProduct] = useState(null)
  const [notice, setNotice] = useState('')

  const columns = [
    { key: 'name', label: 'Product', render: (row) => <div><div className="fw-medium">{row.name}</div><div className="small text-secondary">{row.sku}</div></div> },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (row) => `$${row.price}` },
    { key: 'stockStatus', label: 'Stock status', render: (row) => <StatusBadge value={row.stockStatus} /> },
    { key: 'visibility', label: 'Visibility', render: (row) => <StatusBadge value={row.visibility} /> },
    { key: 'seoStatus', label: 'SEO status', render: (row) => <StatusBadge value={row.seoStatus} /> },
    { key: 'updatedAt', label: 'Last updated' },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-end',
      headerClassName: 'text-end',
      render: (row) => (
        <button className="btn btn-sm btn-outline-success" onClick={() => setEditingProduct(row)} type="button">
          Edit
        </button>
      ),
    },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader
        eyebrow="Products"
        title="Frontend product catalog management"
        description="Manage product data, metadata, visibility, and catalog structure before live catalog services are connected."
        actionLabel="Add product"
        onAction={() =>
          setEditingProduct({
            id: null,
            name: '',
            sku: '',
            category: productCategories[0].name,
            price: 0,
            stockStatus: 'Draft',
            visibility: 'Visible',
            seoStatus: 'Draft',
            updatedAt: 'Today',
          })
        }
      />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <DashboardTable columns={columns} rows={products} />
        </div>
      </div>

      {editingProduct ? (
        <div className="app-modal-backdrop">
          <div className="app-modal card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">{editingProduct.id ? 'Edit product' : 'Add product'}</h2>
                <button className="btn-close" onClick={() => setEditingProduct(null)} type="button" />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Product name</label>
                  <input className="form-control" value={editingProduct.name} onChange={(event) => setEditingProduct({ ...editingProduct, name: event.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SKU</label>
                  <input className="form-control" value={editingProduct.sku} onChange={(event) => setEditingProduct({ ...editingProduct, sku: event.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={editingProduct.category} onChange={(event) => setEditingProduct({ ...editingProduct, category: event.target.value })}>
                    {productCategories.map((category) => <option key={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Price</label>
                  <input className="form-control" type="number" value={editingProduct.price} onChange={(event) => setEditingProduct({ ...editingProduct, price: Number(event.target.value) })} />
                </div>
                <div className="col-12">
                  <label className="form-label">SEO description</label>
                  <textarea className="form-control" rows="3" defaultValue="Short search description for this product, including the value proposition and category context." />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setEditingProduct(null)} type="button">Cancel</button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    if (editingProduct.id) {
                      setProducts(products.map((product) => (product.id === editingProduct.id ? editingProduct : product)))
                      setNotice(`Updated ${editingProduct.name}.`)
                    } else {
                      setProducts([{ ...editingProduct, id: Date.now(), updatedAt: 'Today' }, ...products])
                      setNotice(`Added ${editingProduct.name || 'new product'}.`)
                    }
                    setEditingProduct(null)
                  }}
                  type="button"
                >
                  Save product
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
