import { Link } from 'react-router-dom'

export default function SignupPage() {
  return (
    <section className="py-5 bg-white min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 mb-2">Create your project workspace</h1>
                <p className="text-secondary">Set up access for planning pages, products, SEO, hosting, and support in one dashboard.</p>
                <form className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="signupName">Name</label>
                    <input className="form-control" id="signupName" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="signupBusiness">Business name</label>
                    <input className="form-control" id="signupBusiness" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="signupEmail">Email</label>
                    <input className="form-control" id="signupEmail" type="email" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="signupPackage">Package</label>
                    <select className="form-select" id="signupPackage" defaultValue="Growth Store">
                      <option>Starter Store</option>
                      <option>Growth Store</option>
                      <option>Custom Store</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="signupPassword">Password</label>
                    <input className="form-control" id="signupPassword" type="password" />
                  </div>
                  <div className="col-12 d-flex flex-column flex-sm-row gap-2">
                    <Link className="btn btn-success" to="/dashboard">Create account</Link>
                    <Link className="btn btn-outline-dark" to="/pricing">Review packages</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
