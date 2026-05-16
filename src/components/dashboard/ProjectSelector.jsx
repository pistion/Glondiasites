import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { activeProject, projects } from '../../data/dashboardMockData.js'

export default function ProjectSelector() {
  return (
    <div className="dropdown">
      <button
        aria-expanded="false"
        className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
        data-bs-toggle="dropdown"
        type="button"
      >
        <span className="text-start">
          <span className="d-block fw-semibold">{activeProject.name}</span>
          <span className="d-block small text-secondary">{activeProject.businessName}</span>
        </span>
        <ChevronDown size={16} />
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow-sm">
        {projects.map((project) => (
          <li key={project.id}>
            <Link className="dropdown-item py-2" to={project.id === activeProject.id ? '/dashboard' : `/dashboard/projects/${project.id}`}>
              <div className="fw-medium">{project.name}</div>
              <div className="small text-secondary">{project.businessName}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
