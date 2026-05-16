import { Link } from 'react-router-dom'
import SectionHeader from '../../../components/common/SectionHeader.jsx'
import { supportOptions } from '../../../data/publicContent.js'

export default function SupportCta() {
  return (
    <section className="py-5 bg-white">
      <div className="container-xl">
        <SectionHeader
          description="Choose the support path that matches your stage, from initial planning to ongoing revisions."
          title="Questions Before Starting?"
        />
        <div className="row g-3">
          {supportOptions.map((option) => (
            <div className="col-md-4" key={option.title}>
              <div className="border rounded-3 p-4 h-100 bg-light">
                <h3 className="h6">{option.title}</h3>
                <p className="text-secondary small mb-3">{option.description}</p>
                <Link className="btn btn-sm btn-success" to={option.title === 'Schedule Consultation' ? '/contact' : '/support'}>
                  Continue
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
