import PageHeader from '../../components/common/PageHeader.jsx'
import { processSteps } from '../../data/publicContent.js'

export default function ProcessPage() {
  return (
    <section className="py-5 bg-white min-vh-100">
      <div className="container-xl">
        <PageHeader
          eyebrow="Process"
          title="A structured delivery process from consultation to launch support"
          description="Every stage is designed to keep content, pages, products, and review decisions organized."
        />
        <div className="row g-3 g-lg-4">
          {processSteps.map((step, index) => (
            <div className="col-md-6 col-xl-4" key={step}>
              <div className="border rounded-3 bg-light p-4 h-100">
                <div className="process-number mb-3">{String(index + 1).padStart(2, '0')}</div>
                <h2 className="h5">{step}</h2>
                <p className="text-secondary mb-0">
                  This stage is tracked in the dashboard so project details stay connected and reviewable.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
