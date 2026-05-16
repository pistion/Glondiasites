import { useMemo, useState } from 'react'
import { Archive, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader.jsx'
import ConfirmModal from '../../components/common/ConfirmModal.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import DashboardTable from '../../components/dashboard/DashboardTable.jsx'
import { projects } from '../../data/dashboardMockData.js'

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [projectToArchive, setProjectToArchive] = useState(null)
  const [notice, setNotice] = useState('')

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter
      const matchesSearch = `${project.name} ${project.businessName}`.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [search, statusFilter])

  const columns = [
    { key: 'name', label: 'Project name', render: (row) => <div><div className="fw-medium">{row.name}</div><div className="small text-secondary">{row.businessName}</div></div> },
    { key: 'packageName', label: 'Package' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'pages', label: 'Pages' },
    { key: 'products', label: 'Products' },
    { key: 'updatedAt', label: 'Last updated' },
    {
      key: 'actions',
      label: 'Actions',
      headerClassName: 'text-end',
      className: 'text-end',
      render: (row) => (
        <div className="d-flex justify-content-end gap-2">
          <Link className="btn btn-sm btn-outline-success" to={row.id === projects[0].id ? '/dashboard' : `/dashboard/projects/${row.id}`}>Open</Link>
          <Link className="btn btn-sm btn-outline-secondary" to={`/dashboard/projects/${row.id}`}><ExternalLink size={14} /></Link>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setProjectToArchive(row)} type="button">
            <Archive size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="d-grid gap-4">
      <PageHeader
        eyebrow="Projects"
        title="Ecommerce website projects"
        description="Track all client storefront builds and move into the full workspace from a single list."
      />

      <div className="card border-0 shadow-sm dashboard-panel">
        <div className="card-body p-4">
          {notice ? <div className="alert alert-success">{notice}</div> : null}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="projectSearch">Search projects</label>
              <input className="form-control" id="projectSearch" onChange={(event) => setSearch(event.target.value)} placeholder="Search by project or business name" value={search} />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="projectStatus">Status</label>
              <select className="form-select" id="projectStatus" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                <option>All</option>
                <option>In progress</option>
                <option>Needs review</option>
                <option>Draft</option>
              </select>
            </div>
          </div>
          <DashboardTable columns={columns} rows={filteredProjects} />
        </div>
      </div>

      {projectToArchive ? (
        <ConfirmModal
          confirmLabel="Archive project"
          description={`This action will mark "${projectToArchive.name}" as archived in the current workspace.`}
          onCancel={() => setProjectToArchive(null)}
          onConfirm={() => {
            setNotice(`Archive request recorded for ${projectToArchive.name}.`)
            setProjectToArchive(null)
          }}
          title="Archive project?"
        />
      ) : null}
    </div>
  )
}
