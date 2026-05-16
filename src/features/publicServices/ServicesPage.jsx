import { CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { serviceCards } from '../../data/publicContent.js'

export default function ServicesPage() {
  return (
    <section className="py-5 bg-light min-vh-100">
      <div className="container-xl">
        <PageHeader
          eyebrow="Services"
          title="Ecommerce website services built around real project delivery"
          description="Glondia combines design, catalog setup, storefront UI, SEO planning, hosting preparation, and support inside one coordinated workflow."
        />
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="row g-3">
              {serviceCards.map((service) => (
                <div className="col-md-6" key={service.title}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h2 className="h5">{service.title}</h2>
                      <p className="text-secondary mb-0">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">Included in every workflow</h2>
                <ul className="list-unstyled d-grid gap-3 mb-0">
                  {[
                    'Clear project scope and page planning',
                    'Shared dashboard for products, pages, SEO, and support',
                    'Revision workflow with messages and tickets',
                    'Launch preparation for domain, hosting, and handoff',
                  ].map((item) => (
                    <li className="d-flex align-items-start gap-2" key={item}>
                      <CheckCircle2 className="text-success mt-1" size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
