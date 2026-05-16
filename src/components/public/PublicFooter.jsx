import { Link } from 'react-router-dom'
import Logo from '../common/Logo.jsx'
import { footerGroups } from '../../data/publicContent.js'

export default function PublicFooter() {
  return (
    <footer className="border-top bg-white py-5">
      <div className="container-xl">
        <div className="row g-4">
          <div className="col-lg-4">
            <Logo compact />
            <p className="text-secondary mt-3 mb-0">
              Glondia helps businesses plan, build, launch, and manage professional ecommerce websites from one clean workspace.
            </p>
          </div>
          {footerGroups.map((group) => (
            <div className="col-6 col-md-4 col-lg-2" key={group.title}>
              <h2 className="h6">{group.title}</h2>
              <ul className="list-unstyled small mb-0 d-grid gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link className="text-secondary text-decoration-none" to={link.to}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
