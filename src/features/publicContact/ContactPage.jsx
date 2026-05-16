import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="py-5 bg-white min-vh-100">
      <div className="container-xl">
        <PageHeader
          eyebrow="Contact"
          title="Start your ecommerce website project with Glondia"
          description="Share your business goals, expected catalog size, and preferred timeline so we can recommend the right package."
        />
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card border shadow-sm">
              <div className="card-body p-4">
                {submitted ? <div className="alert alert-success">Your project request has been captured and added to the Glondia intake queue.</div> : null}
                <form
                  className="row g-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setSubmitted(true)
                  }}
                >
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contactName">Name</label>
                    <input className="form-control" id="contactName" placeholder="Your name" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contactEmail">Email</label>
                    <input className="form-control" id="contactEmail" placeholder="you@example.com" required type="email" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contactBusiness">Business name</label>
                    <input className="form-control" id="contactBusiness" placeholder="Business name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contactPackage">Preferred package</label>
                    <select className="form-select" id="contactPackage" defaultValue="Growth Store">
                      <option>Starter Store</option>
                      <option>Growth Store</option>
                      <option>Custom Store</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="contactMessage">Project details</label>
                    <textarea className="form-control" id="contactMessage" placeholder="Tell us about your store, products, and timeline." rows="5" />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-success" type="submit">Send project request</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card border shadow-sm h-100">
              <div className="card-body p-4">
                <h2 className="h5">What to include</h2>
                <ul className="text-secondary mb-0 d-grid gap-2 ps-3">
                  <li>Business type and target audience</li>
                  <li>Approximate page count and product count</li>
                  <li>Design references or brand notes</li>
                  <li>Preferred launch timing</li>
                  <li>Support needs after launch</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
