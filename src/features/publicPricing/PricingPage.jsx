import PageHeader from '../../components/common/PageHeader.jsx'
import { pricingPackages } from '../../data/publicContent.js'

export default function PricingPage() {
  return (
    <section className="py-5 bg-light min-vh-100">
      <div className="container-xl">
        <PageHeader
          eyebrow="Pricing"
          title="Choose the website package that fits your scope"
          description="Package details stay intentionally clear so you can choose the right delivery level before refining specifics with the Glondia team."
        />
        <div className="row g-4">
          {pricingPackages.map((pkg) => (
            <div className="col-lg-4" key={pkg.name}>
              <div className={`card border-0 shadow-sm h-100 ${pkg.featured ? 'package-card-featured' : ''}`}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0">{pkg.name}</h2>
                    {pkg.featured ? <span className="badge text-bg-success">Most used</span> : null}
                  </div>
                  <p className="text-secondary">{pkg.summary}</p>
                  <table className="table table-sm mb-0">
                    <tbody>
                      <tr><th>Pages</th><td>{pkg.pages}</td></tr>
                      <tr><th>Products</th><td>{pkg.products}</td></tr>
                      <tr><th>Design</th><td>{pkg.design}</td></tr>
                      <tr><th>SEO</th><td>{pkg.seo}</td></tr>
                      <tr><th>Support</th><td>{pkg.support}</td></tr>
                      <tr><th>Dashboard access</th><td>Included</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
