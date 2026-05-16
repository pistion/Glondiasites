import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { ticketActivity, tickets as initialTickets } from '../../data/dashboardMockData.js'

const detailTabs = ['Conversation', 'Details', 'Attachments', 'Activity']

export default function TicketsPage() {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState(initialTickets[0])
  const [activeTab, setActiveTab] = useState('Conversation')
  const [showModal, setShowModal] = useState(false)
  const [notice, setNotice] = useState('')
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Design request',
    priority: 'Medium',
  })

  const columns = [
    { key: 'id', label: 'Ticket ID', render: (row) => <button className="btn btn-link p-0 text-decoration-none" onClick={() => setSelectedTicket(row)} type="button">{row.id}</button> },
    { key: 'subject', label: 'Subject' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', render: (row) => <StatusBadge value={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'assignedTeam', label: 'Assigned team' },
    { key: 'updatedAt', label: 'Last updated' },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Tickets" title="Structured support requests" description="Track design requests, catalog updates, hosting help, billing questions, and bug reports in one table." actionLabel="New ticket" onAction={() => setShowModal(true)} />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm dashboard-panel">
            <div className="card-body p-4">
              <DashboardTable columns={columns} rows={tickets} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-1">{selectedTicket.subject}</h2>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <StatusBadge value={selectedTicket.priority} />
                <StatusBadge value={selectedTicket.status} />
              </div>
              <div className="nav nav-pills gap-2 mb-3">
                {detailTabs.map((tab) => (
                  <button className={`btn btn-sm ${activeTab === tab ? 'btn-success' : 'btn-outline-secondary'}`} key={tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
                ))}
              </div>
              {activeTab === 'Conversation' ? <p className="text-secondary">Use this panel for threaded discussion, ticket replies, and project-linked notes.</p> : null}
              {activeTab === 'Details' ? <p className="text-secondary">Category: {selectedTicket.category}. Assigned team: {selectedTicket.assignedTeam}.</p> : null}
              {activeTab === 'Attachments' ? <p className="text-secondary">Attach screenshots, product lists, branding files, or reference documents here.</p> : null}
              {activeTab === 'Activity' ? (
                <div className="d-grid gap-3">
                  {ticketActivity.map((item) => (
                    <div className="border rounded-3 p-3" key={item.id}>
                      <div className="fw-medium">{item.title}</div>
                      <div className="small text-secondary">{item.detail}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="app-modal-backdrop">
          <div className="app-modal card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Create new ticket</h2>
                <button className="btn-close" onClick={() => setShowModal(false)} type="button" />
              </div>
              <div className="row g-3">
                <div className="col-12"><label className="form-label">Subject</label><input className="form-control" value={newTicket.subject} onChange={(event) => setNewTicket({ ...newTicket, subject: event.target.value })} /></div>
                <div className="col-md-6"><label className="form-label">Category</label><select className="form-select" value={newTicket.category} onChange={(event) => setNewTicket({ ...newTicket, category: event.target.value })}><option>Design request</option><option>Product catalog</option><option>Domain/hosting</option><option>Bug report</option><option>Billing</option><option>Account access</option><option>General question</option></select></div>
                <div className="col-md-6"><label className="form-label">Priority</label><select className="form-select" value={newTicket.priority} onChange={(event) => setNewTicket({ ...newTicket, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></div>
                <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="4" defaultValue="Please review the homepage banner copy and featured collection messaging before final approval." /></div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)} type="button">Cancel</button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    const created = {
                      id: `TCK-${Date.now().toString().slice(-4)}`,
                      subject: newTicket.subject || 'New support request',
                      category: newTicket.category,
                      priority: newTicket.priority,
                      status: 'Open',
                      assignedTeam: 'Support',
                      updatedAt: 'Just now',
                    }
                    setTickets([created, ...tickets])
                    setSelectedTicket(created)
                    setNotice(`Created ticket ${created.id}.`)
                    setShowModal(false)
                  }}
                  type="button"
                >
                  Create ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
