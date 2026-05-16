import SectionHeader from '../../../components/common/SectionHeader.jsx'
import { processSteps } from '../../../data/publicContent.js'

export default function ProcessSection() {
  return (
    <section className="py-5 bg-light">
      <div className="container-xl">
        <SectionHeader
          description="A practical workflow that moves from planning to launch without losing track of content, products, or approvals."
          title="A Simple Process From Plan to Launch"
        />
        <div className="row g-3">
          {processSteps.map((step, index) => (
            <div className="col-md-6 col-xl" key={step}>
              <div className="process-step h-100 border rounded-3 bg-white p-4">
                <div className="process-number mb-3">{String(index + 1).padStart(2, '0')}</div>
                <h3 className="h6 mb-0">{step}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
