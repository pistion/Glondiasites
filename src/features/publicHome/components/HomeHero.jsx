import { ArrowRight, BadgeCheck, LayoutPanelTop, ShoppingCart, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { heroTrustPoints } from '../../../data/publicContent.js'

export default function HomeHero() {
  return (
    <section className="hero-section py-5 py-lg-6">
      <div className="container-xl">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="hero-label">Ecommerce Website Services</span>
            <h1 className="display-5 fw-semibold text-white mt-3 mb-3">
              Professional Ecommerce Websites Built for Growing Businesses
            </h1>
            <p className="lead text-white-50 mb-4">
              Glondia helps businesses plan, design, build, and launch modern ecommerce websites with product pages,
              checkout-ready layouts, hosting preparation, domain setup, SEO structure, and ongoing support.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
              <Link className="btn btn-success btn-lg" to="/signup">
                Start Your Ecommerce Project
              </Link>
              <Link className="btn btn-outline-light btn-lg" to="/services">
                View Services
              </Link>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 g-2">
              {heroTrustPoints.map((point) => (
                <div className="col" key={point}>
                  <div className="d-flex align-items-center gap-2 text-white-50 small">
                    <BadgeCheck size={16} />
                    <span>{point}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="store-preview card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="preview-header d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <Store size={18} />
                    <span className="fw-semibold">Store homepage preview</span>
                  </div>
                  <span className="badge text-bg-success">Project active</span>
                </div>
                <div className="row g-0">
                  <div className="col-md-7 p-4">
                    <div className="preview-banner rounded-3 p-4 mb-4">
                      <span className="text-uppercase small text-success fw-semibold">Featured collection</span>
                      <h2 className="h4 mt-2 mb-2">A clean storefront ready for launch</h2>
                      <p className="text-secondary mb-0">Plan the homepage, product collections, and support content in one workspace.</p>
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="preview-product card h-100">
                          <div className="card-body">
                            <LayoutPanelTop className="text-success mb-3" size={20} />
                            <h3 className="h6">Homepage layout</h3>
                            <p className="small text-secondary mb-0">Hero, category grid, promotions, and FAQ prepared.</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="preview-product card h-100">
                          <div className="card-body">
                            <ShoppingCart className="text-success mb-3" size={20} />
                            <h3 className="h6">Cart and checkout UI</h3>
                            <p className="small text-secondary mb-0">Checkout-ready structure aligned to shipping, customer details, and order review.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 border-start bg-light">
                    <div className="p-4 h-100 d-flex flex-column gap-3">
                      <div className="small text-uppercase text-secondary fw-semibold">Cart summary panel</div>
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2"><span>Featured set</span><strong>$49</strong></div>
                          <div className="d-flex justify-content-between mb-2"><span>Launch bundle</span><strong>$79</strong></div>
                          <hr />
                          <div className="d-flex justify-content-between"><span>Total</span><strong>$128</strong></div>
                        </div>
                      </div>
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fw-semibold">Order status row</span>
                            <span className="badge text-bg-warning">Pending review</span>
                          </div>
                          <p className="small text-secondary mb-0">Domain connected, product upload in progress, SEO checklist open.</p>
                        </div>
                      </div>
                      <Link className="btn btn-success mt-auto" to="/dashboard">
                        Open dashboard preview
                        <ArrowRight className="ms-2" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
