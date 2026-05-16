import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader.jsx'
import SectionHeader from '../../components/common/SectionHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { activeProject, launchChecklist, projectFiles } from '../../data/dashboardMockData.js'

const tabs = ['Overview', 'Business Info', 'Store Setup', 'Design Preferences', 'Launch Checklist', 'Files', 'Notes']

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const [activeTab, setActiveTab] = useState('Overview')
  const [saved, setSaved] = useState(false)

  const projectName = projectId === activeProject.id ? activeProject.name : 'Project Detail'

  return (
    <div className="d-grid gap-4">
      <PageHeader
        eyebrow="Project detail"
        title={projectName}
        description="Central workspace for business information, design preferences, launch prep, files, and notes."
        actionLabel="Save changes"
        onAction={() => setSaved(true)}
      />

      {saved ? <div className="alert alert-success">Project changes saved locally in this workspace.</div> : null}

      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="nav nav-tabs flex-nowrap overflow-auto mb-4">
            {tabs.map((tab) => (
              <button
                className={`nav-link ${tab === activeTab ? 'active' : ''}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' ? (
            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded-3 p-4 h-100">
                  <SectionHeader title="Project status" />
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <StatusBadge value={activeProject.status} />
                    <StatusBadge value={activeProject.domain.status} />
                    <StatusBadge value={activeProject.hosting.deploymentStatus} />
                  </div>
                  <p className="text-secondary mb-0">Launch target: {activeProject.launchTarget}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded-3 p-4 h-100">
                  <SectionHeader title="Theme and package" />
                  <ul className="list-unstyled mb-0 d-grid gap-2">
                    <li><strong>Package:</strong> {activeProject.packageName}</li>
                    <li><strong>Storefront theme:</strong> {activeProject.storefrontTheme}</li>
                    <li><strong>Preferred domain:</strong> {activeProject.domain.preferred}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'Business Info' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Business name</label><input className="form-control" defaultValue={activeProject.businessName} /></div>
              <div className="col-md-6"><label className="form-label">Business email</label><input className="form-control" defaultValue={activeProject.businessProfile.email} /></div>
              <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" defaultValue={activeProject.businessProfile.phone} /></div>
              <div className="col-md-6"><label className="form-label">Country</label><input className="form-control" defaultValue={activeProject.businessProfile.country} /></div>
              <div className="col-md-6"><label className="form-label">Timezone</label><input className="form-control" defaultValue={activeProject.businessProfile.timezone} /></div>
              <div className="col-md-6"><label className="form-label">Currency</label><input className="form-control" defaultValue={activeProject.businessProfile.currency} /></div>
              <div className="col-12"><label className="form-label">Business description</label><textarea className="form-control" defaultValue={activeProject.businessProfile.description} rows="4" /></div>
            </div>
          ) : null}

          {activeTab === 'Store Setup' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Store name</label><input className="form-control" defaultValue={activeProject.storeSetup.storeName} /></div>
              <div className="col-md-6"><label className="form-label">Store URL preference</label><input className="form-control" defaultValue={activeProject.storeSetup.preferredUrl} /></div>
              <div className="col-md-6"><label className="form-label">Main product type</label><input className="form-control" defaultValue={activeProject.storeSetup.productType} /></div>
              <div className="col-md-6"><label className="form-label">Product count</label><input className="form-control" defaultValue={activeProject.storeSetup.productCount} /></div>
              <div className="col-md-4"><label className="form-label">Shipping required</label><input className="form-control" defaultValue={activeProject.storeSetup.shippingRequired} /></div>
              <div className="col-md-4"><label className="form-label">Local pickup</label><input className="form-control" defaultValue={activeProject.storeSetup.localPickup} /></div>
              <div className="col-md-4"><label className="form-label">Digital products</label><input className="form-control" defaultValue={activeProject.storeSetup.digitalProducts} /></div>
              <div className="col-12"><label className="form-label">Tax display preference</label><input className="form-control" defaultValue={activeProject.storeSetup.taxDisplayPreference} /></div>
            </div>
          ) : null}

          {activeTab === 'Design Preferences' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Primary color</label><input className="form-control" defaultValue={activeProject.storefront.primaryColor} /></div>
              <div className="col-md-6"><label className="form-label">Secondary color</label><input className="form-control" defaultValue={activeProject.storefront.secondaryColor} /></div>
              <div className="col-md-6"><label className="form-label">Typography</label><input className="form-control" defaultValue={activeProject.storefront.typography} /></div>
              <div className="col-md-6"><label className="form-label">Header style</label><input className="form-control" defaultValue={activeProject.storefront.headerStyle} /></div>
              <div className="col-12"><label className="form-label">Homepage sections required</label><textarea className="form-control" defaultValue={activeProject.requestedSections.join(', ')} rows="3" /></div>
            </div>
          ) : null}

          {activeTab === 'Launch Checklist' ? (
            <div className="list-group list-group-flush">
              {launchChecklist.map((item) => (
                <div className="list-group-item px-0 d-flex justify-content-between align-items-center" key={item.id}>
                  <span>{item.label}</span>
                  <StatusBadge value={item.done ? 'Ready' : 'Needs review'} />
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Files' ? (
            <div className="row g-3">
              {projectFiles.map((file) => (
                <div className="col-md-4" key={file.id}>
                  <div className="border rounded-3 p-3 h-100">
                    <div className="fw-medium">{file.label}</div>
                    <div className="small text-secondary">{file.type}</div>
                    <div className="small text-secondary mt-2">Uploaded {file.uploadedAt}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Notes' ? (
            <div className="row g-3">
              <div className="col-lg-6">
                <label className="form-label">Internal project notes</label>
                <textarea className="form-control" defaultValue="Keep the storefront tone practical and product-led. Client prefers a clean catalogue-first homepage." rows="6" />
              </div>
              <div className="col-lg-6">
                <label className="form-label">Client notes</label>
                <textarea className="form-control" defaultValue="Please keep the navigation simple and make product filters easy to understand on mobile." rows="6" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
