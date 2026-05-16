import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { globalSeoFields, socialPreviewChecks, technicalMetadataItems } from '../../data/ecommerceMetaFields.js'
import { ecommercePages, products } from '../../data/dashboardMockData.js'

const tabs = ['Global SEO', 'Page SEO', 'Product SEO', 'Social Preview', 'Technical Metadata']

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState('Global SEO')
  const [saved, setSaved] = useState(false)

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="SEO and metadata" title="Manage ecommerce metadata" description="Draft the fields needed for discoverability, search previews, and technical storefront setup." actionLabel="Save SEO settings" onAction={() => setSaved(true)} />
      {saved ? <div className="alert alert-success">SEO settings saved locally for this storefront workspace.</div> : null}
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="nav nav-tabs flex-nowrap overflow-auto mb-4">
            {tabs.map((tab) => (
              <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
            ))}
          </div>

          {activeTab === 'Global SEO' ? (
            <div className="row g-3">
              {globalSeoFields.map((field) => (
                <div className="col-12" key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input className="form-control" defaultValue={field.value} />
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Page SEO' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Page selector</label><select className="form-select">{ecommercePages.map((page) => <option key={page.id}>{page.title}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label">Index setting</label><select className="form-select"><option>Index</option><option>No index</option></select></div>
              <div className="col-12"><label className="form-label">SEO title</label><input className="form-control" defaultValue="Shop | Glondia" /></div>
              <div className="col-12"><label className="form-label">Meta description</label><textarea className="form-control" rows="4" defaultValue="Browse Glondia storefront packages, featured products, and launch-ready ecommerce planning services." /></div>
            </div>
          ) : null}

          {activeTab === 'Product SEO' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Product selector</label><select className="form-select">{products.map((product) => <option key={product.id}>{product.name}</option>)}</select></div>
              <div className="col-md-6"><label className="form-label">URL slug</label><input className="form-control" defaultValue="premium-launch-bundle" /></div>
              <div className="col-12"><label className="form-label">SEO title</label><input className="form-control" defaultValue="Premium Launch Bundle | Glondia" /></div>
              <div className="col-12"><label className="form-label">SEO description</label><textarea className="form-control" rows="4" defaultValue="Premium Launch Bundle combines storefront setup, merchandising structure, and support planning for a polished ecommerce launch." /></div>
            </div>
          ) : null}

          {activeTab === 'Social Preview' ? (
            <div className="row g-3">
              {socialPreviewChecks.map((item) => (
                <div className="col-md-4" key={item.id}>
                  <div className="border rounded-3 p-3 h-100">
                    <div className="fw-medium mb-2">{item.title}</div>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Technical Metadata' ? (
            <div className="row g-3">
              {technicalMetadataItems.map((item) => (
                <div className="col-md-6" key={item.id}>
                  <div className="border rounded-3 p-3 d-flex justify-content-between align-items-center">
                    <span>{item.label}</span>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
