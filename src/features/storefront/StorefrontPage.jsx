import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { storefrontSections } from '../../data/dashboardMockData.js'

const tabs = ['Header', 'Homepage', 'Product Listing', 'Product Details', 'Cart', 'Checkout UI', 'Footer']

export default function StorefrontPage() {
  const [activeTab, setActiveTab] = useState('Homepage')
  const [saved, setSaved] = useState(false)

  return (
    <div className="d-grid gap-4">
      <PageHeader
        eyebrow="Storefront"
        title="Manage visible storefront sections"
        description="Configure navigation, homepage modules, product presentation, cart behavior, and checkout UI preparation."
        actionLabel="Save storefront settings"
        onAction={() => setSaved(true)}
      />
      {saved ? <div className="alert alert-success">Storefront settings saved locally in this workspace.</div> : null}
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="nav nav-tabs flex-nowrap overflow-auto mb-4">
            {tabs.map((tab) => (
              <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => setActiveTab(tab)} type="button">
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Homepage' ? (
            <div className="row g-3">
              {storefrontSections.map((section) => (
                <div className="col-12" key={section.id}>
                  <div className="border rounded-3 p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <div className="fw-medium">{section.name}</div>
                      <div className="small text-secondary">Last edited {section.updatedAt}</div>
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <StatusBadge value={section.status} />
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input" defaultChecked={section.visible} id={`visible-${section.id}`} type="checkbox" />
                        <label className="form-check-label small" htmlFor={`visible-${section.id}`}>Visible</label>
                      </div>
                      <button className="btn btn-sm btn-outline-secondary" type="button">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab !== 'Homepage' ? (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">{activeTab} primary option</label>
                <input className="form-control" defaultValue={`${activeTab} standard layout`} />
              </div>
              <div className="col-md-6">
                <label className="form-label">{activeTab} secondary option</label>
                <input className="form-control" defaultValue={`${activeTab} business-friendly configuration`} />
              </div>
              <div className="col-12">
                <label className="form-label">{activeTab} notes</label>
                <textarea className="form-control" defaultValue={`Use clean and clear ${activeTab.toLowerCase()} UI with practical wording and consistent spacing.`} rows="4" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
