import { Link } from 'react-router-dom'
import SectionHeader from '../../../components/common/SectionHeader.jsx'
import { pricingPackages } from '../../../data/publicContent.js'

export default function PricingIntro() {
  return (
    <section className="py-5 bg-white">
      <div className="container-xl">
        <SectionHeader
          description="Choose the level of storefront scope and support that fits your business, then refine the details in the dashboard."
          title="Clear Website Packages"
          action={<Link className="btn btn-outline-success" to="/pricing">See package details</Link>}
        />
        <div className="row g-3">
          {pricingPackages.map((pkg) => (
            <div className="col-lg-4" key={pkg.name}>
              <div className={`card h-100 border ${pkg.featured ? 'package-card-featured' : ''}`}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 mb-0">{pkg.name}</h3>
                    {pkg.featured ? <span className="badge text-bg-success">Recommended</span> : null}
                  </div>
                  <p className="text-secondary">{pkg.summary}</p>
                  <ul className="list-unstyled small d-grid gap-2 mb-0">
                    <li><strong>Pages:</strong> {pkg.pages}</li>
                    <li><strong>Products:</strong> {pkg.products}</li>
                    <li><strong>Design:</strong> {pkg.design}</li>
                    <li><strong>SEO:</strong> {pkg.seo}</li>
                    <li><strong>Support:</strong> {pkg.support}</li>
                    <li><strong>Dashboard:</strong> Included</li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
