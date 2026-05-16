import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <section className="py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 mb-2">Login</h1>
                <p className="text-secondary">Access your ecommerce website workspace.</p>
                <form className="d-grid gap-3">
                  <div>
                    <label className="form-label" htmlFor="loginEmail">Email</label>
                    <input className="form-control" defaultValue="hello@glondia.com" id="loginEmail" type="email" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="loginPassword">Password</label>
                    <input className="form-control" id="loginPassword" type="password" />
                  </div>
                  <Link className="btn btn-success" to="/dashboard">Enter dashboard</Link>
                </form>
                <p className="small text-secondary mt-3 mb-0">
                  Need an account? <Link to="/signup">Create one here</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
