import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { accountNotifications, activeProject, teamMembers } from '../../data/dashboardMockData.js'

const tabs = ['Profile', 'Business Details', 'Security', 'Team Members', 'Notifications']

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [notice, setNotice] = useState('')

  const teamColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'lastActive', label: 'Last active' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Account" title="User profile and account settings" description="Manage profile details, business information, security settings, team access, and notification preferences." />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          <div className="nav nav-tabs flex-nowrap overflow-auto mb-4">
            {tabs.map((tab) => (
              <button className={`nav-link ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
            ))}
          </div>

          {activeTab === 'Profile' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" defaultValue="Sarah Kora" /></div>
              <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" defaultValue={activeProject.businessProfile.email} /></div>
              <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" defaultValue={activeProject.businessProfile.phone} /></div>
              <div className="col-md-6"><label className="form-label">Role</label><input className="form-control" defaultValue="Owner" /></div>
              <div className="col-12"><button className="btn btn-success" onClick={() => setNotice('Profile saved locally.')} type="button">Save profile</button></div>
            </div>
          ) : null}

          {activeTab === 'Business Details' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">Business name</label><input className="form-control" defaultValue={activeProject.businessName} /></div>
              <div className="col-md-6"><label className="form-label">Website</label><input className="form-control" defaultValue={activeProject.domain.primary} /></div>
              <div className="col-md-6"><label className="form-label">Country</label><input className="form-control" defaultValue={activeProject.businessProfile.country} /></div>
              <div className="col-md-6"><label className="form-label">Currency</label><input className="form-control" defaultValue={activeProject.businessProfile.currency} /></div>
              <div className="col-md-6"><label className="form-label">Timezone</label><input className="form-control" defaultValue={activeProject.businessProfile.timezone} /></div>
              <div className="col-md-6"><label className="form-label">Business phone</label><input className="form-control" defaultValue={activeProject.businessProfile.phone} /></div>
              <div className="col-12"><label className="form-label">Address</label><input className="form-control" defaultValue={activeProject.businessProfile.address} /></div>
              <div className="col-12"><button className="btn btn-success" onClick={() => setNotice('Business details saved locally.')} type="button">Save business details</button></div>
            </div>
          ) : null}

          {activeTab === 'Security' ? (
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label">New password</label><input className="form-control" type="password" /></div>
              <div className="col-md-6"><label className="form-label">Confirm password</label><input className="form-control" type="password" /></div>
              <div className="col-md-6"><label className="form-label">Two-factor authentication</label><input className="form-control" defaultValue="Not configured" readOnly /></div>
              <div className="col-md-6"><label className="form-label">Active sessions</label><input className="form-control" defaultValue="2 active sessions" readOnly /></div>
              <div className="col-12"><div className="small text-secondary">Connect your authentication service next to make security controls live for every team member.</div></div>
              <div className="col-12"><button className="btn btn-success" onClick={() => setNotice('Security settings saved locally.')} type="button">Save security settings</button></div>
            </div>
          ) : null}

          {activeTab === 'Team Members' ? (
            <DashboardTable columns={teamColumns} rows={teamMembers} />
          ) : null}

          {activeTab === 'Notifications' ? (
            <div className="d-grid gap-3">
              {accountNotifications.map((setting) => (
                <div className="form-check form-switch border rounded-3 p-3" key={setting.id}>
                  <input className="form-check-input" defaultChecked={setting.enabled} id={setting.id} type="checkbox" />
                  <label className="form-check-label ms-2" htmlFor={setting.id}>{setting.label}</label>
                </div>
              ))}
              <div><button className="btn btn-success" onClick={() => setNotice('Notification preferences saved locally.')} type="button">Save notification settings</button></div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
