import PageHeader from '../../components/common/PageHeader.jsx'
import { supportFaqs, supportOptions } from '../../data/publicContent.js'

export default function SupportPage() {
  return (
    <section className="py-5 bg-light min-vh-100">
      <div className="container-xl">
        <PageHeader
          eyebrow="Support"
          title="Support paths for project planning, updates, and revisions"
          description="Choose messaging, ticketing, or consultation based on the kind of help you need."
        />
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="row g-3">
              {supportOptions.map((option) => (
                <div className="col-12" key={option.title}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <h2 className="h5">{option.title}</h2>
                      <p className="text-secondary mb-0">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-7">
            <div className="accordion" id="supportFaq">
              {supportFaqs.map((item, index) => (
                <div className="accordion-item" key={item.question}>
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${index === 0 ? '' : 'collapsed'}`}
                      data-bs-target={`#faq-${index}`}
                      data-bs-toggle="collapse"
                      type="button"
                    >
                      {item.question}
                    </button>
                  </h2>
                  <div className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} data-bs-parent="#supportFaq" id={`faq-${index}`}>
                    <div className="accordion-body text-secondary">{item.answer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
