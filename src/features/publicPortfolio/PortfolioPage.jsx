import PageHeader from '../../components/common/PageHeader.jsx'
import { portfolioItems } from '../../data/publicContent.js'

export default function PortfolioPage() {
  return (
    <section className="py-5 bg-white min-vh-100">
      <div className="container-xl">
        <PageHeader
          eyebrow="Work"
          title="Website directions prepared for modern ecommerce businesses"
          description="These categories show the kinds of storefront structures and content flows Glondia is designed to support."
        />
        <div className="row g-4">
          {portfolioItems.map((item, index) => (
            <div className="col-lg-4" key={item.title}>
              <div className="card border h-100">
                <div className={`portfolio-surface portfolio-surface-${index + 1}`} />
                <div className="card-body p-4">
                  <h2 className="h5">{item.title}</h2>
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
