import { Link } from 'react-router-dom'
import SectionHeader from '../../../components/common/SectionHeader.jsx'
import { portfolioItems } from '../../../data/publicContent.js'

export default function PortfolioPreview() {
  return (
    <section className="py-5 bg-light">
      <div className="container-xl">
        <SectionHeader
          description="We focus on dependable structure, clean content presentation, and business-friendly user flows."
          title="Clean Ecommerce Layouts for Modern Businesses"
          action={<Link className="btn btn-outline-dark" to="/portfolio">View work areas</Link>}
        />
        <div className="row g-3">
          {portfolioItems.map((item, index) => (
            <div className="col-lg-4" key={item.title}>
              <div className="card h-100 border-0 shadow-sm">
                <div className={`portfolio-surface portfolio-surface-${index + 1}`} />
                <div className="card-body p-4">
                  <h3 className="h5">{item.title}</h3>
                  <p className="text-secondary mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
