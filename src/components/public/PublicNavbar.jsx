import { NavLink, Link } from 'react-router-dom'
import Logo from '../common/Logo.jsx'
import { publicNavItems } from '../../data/publicContent.js'

export default function PublicNavbar() {
  return (
    <nav className="navbar navbar-expand-lg public-navbar border-bottom bg-white sticky-top">
      <div className="container-xl">
        <Logo />
        <button
          aria-controls="publicNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          className="navbar-toggler"
          data-bs-target="#publicNav"
          data-bs-toggle="collapse"
          type="button"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="publicNav">
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0">
            {publicNavItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink className="nav-link px-lg-3" to={item.to}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <Link className="btn btn-outline-dark" to="/login">Login</Link>
            <Link className="btn btn-success" to="/signup">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
