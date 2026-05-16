import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import ConfirmModal from '../../components/common/ConfirmModal.jsx'
import { activeProject } from '../../data/dashboardMockData.js'

const tabs = ['Workspace', 'Branding', 'Preferences', 'Integrations', 'Danger Zone']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Workspace')
  const [notice, setNotice] = useState('')
  const [dangerAction, setDangerAction] = useState('')

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Settings" title="Workspace and project settings" description="Control workspace defaults, branding rules, interface preferences, and upcoming service connections." />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="nav nav-tabs flex-nowrap overflow-auto mb-4">
            {tabs.map((tab) => (
              <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
            ))}
          </div>

          {activeTab === 'Workspace' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Workspace name</label><input className="form-control" defaultValue="Glondia Ecommerce Workspace" /></div>
              <div className="col-md-6"><label className="form-label">Default language</label><input className="form-control" defaultValue="English" /></div>
              <div className="col-md-6"><label className="form-label">Default currency</label><input className="form-control" defaultValue="PGK" /></div>
              <div className="col-md-6"><label className="form-label">Default project</label><input className="form-control" defaultValue={activeProject.name} /></div>
              <div className="col-12"><button className="btn btn-success" onClick={() => setNotice('Workspace settings saved locally.')} type="button">Save workspace settings</button></div>
            </div>
          ) : null}

          {activeTab === 'Branding' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Primary color</label><input className="form-control" defaultValue="#198754" /></div>
              <div className="col-md-6"><label className="form-label">Secondary color</label><input className="form-control" defaultValue="#050807" /></div>
              <div className="col-md-6"><label className="form-label">Button style</label><input className="form-control" defaultValue="Rounded 8px buttons" /></div>
              <div className="col-md-6"><label className="form-label">Footer text</label><input className="form-control" defaultValue="Built by Glondia" /></div>
              <div className="col-12"><button className="btn btn-success" onClick={() => setNotice('Branding settings saved locally.')} type="button">Save branding settings</button></div>
            </div>
          ) : null}

          {activeTab === 'Preferences' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Date format</label><input className="form-control" defaultValue="YYYY-MM-DD" /></div>
              <div className="col-md-6"><label className="form-label">Timezone</label><input className="form-control" defaultValue="Pacific/Port_Moresby" /></div>
              <div className="col-md-6"><label className="form-label">Dashboard density</label><select className="form-select" defaultValue="Comfortable"><option>Comfortable</option><option>Compact</option></select></div>
              <div className="col-md-6"><label className="form-label">Email preferences</label><select className="form-select" defaultValue="Important only"><option>Important only</option><option>All updates</option></select></div>
              <div className="col-12"><button className="btn btn-success" onClick={() => setNotice('Preference settings saved locally.')} type="button">Save preferences</button></div>
            </div>
          ) : null}

          {activeTab === 'Integrations' ? (
            <div className="row g-3">
              {[
                { title: 'Payments', detail: 'Prepare checkout and invoice connection points for your selected payment provider.' },
                { title: 'Shipping', detail: 'Reserve space for shipping rules, delivery methods, and order fulfillment tools.' },
                { title: 'Email marketing', detail: 'Connect campaigns, signup forms, and customer segments when marketing tools are ready.' },
                { title: 'Analytics', detail: 'Link storefront reporting to live traffic, product, and conversion dashboards.' },
              ].map((item) => (
                <div className="col-md-6" key={item.title}>
                  <div className="border rounded-3 p-3 h-100">
                    <div className="fw-medium">{item.title}</div>
                    <div className="small text-secondary mt-1">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Danger Zone' ? (
            <div className="border border-danger-subtle rounded-3 p-4 bg-danger-subtle">
              <h2 className="h5 text-danger-emphasis">Danger zone</h2>
              <p className="text-secondary">Archive the current workspace when delivery is complete or remove it from the active project queue.</p>
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-outline-danger" onClick={() => setDangerAction('archive')} type="button">Archive project</button>
                <button className="btn btn-danger" onClick={() => setDangerAction('delete')} type="button">Delete project</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {dangerAction ? (
        <ConfirmModal
          confirmLabel={dangerAction === 'archive' ? 'Archive project' : 'Delete project'}
          description={
            dangerAction === 'archive'
              ? 'This UI records the archive action locally and keeps all project data intact.'
              : 'This UI records the delete request locally and does not remove any project files.'
          }
          onCancel={() => setDangerAction('')}
          onConfirm={() => {
            setNotice(`${dangerAction === 'archive' ? 'Archive' : 'Delete'} action recorded locally.`)
            setDangerAction('')
          }}
          title={dangerAction === 'archive' ? 'Archive current project?' : 'Delete current project?'}
        />
      ) : null}
    </div>
  )
}
