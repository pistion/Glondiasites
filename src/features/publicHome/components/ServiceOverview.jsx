import { Globe, Image, LayoutTemplate, LifeBuoy, Search, Server, ShoppingBag, Store } from 'lucide-react'
import SectionHeader from '../../../components/common/SectionHeader.jsx'
import { serviceCards } from '../../../data/publicContent.js'

const icons = [Store, ShoppingBag, LayoutTemplate, Globe, Server, Search, Image, LifeBuoy]

export default function ServiceOverview() {
  return (
    <section className="py-5 bg-white">
      <div className="container-xl">
        <SectionHeader
          description="Structured service delivery focused on the screens, content, and launch preparation your store needs."
          title="Everything Needed to Build Your Online Store"
        />
        <div className="row g-3 g-lg-4">
          {serviceCards.map((service, index) => {
            const Icon = icons[index]
            return (
              <div className="col-md-6 col-xl-3" key={service.title}>
                <div className="card h-100 border service-card">
                  <div className="card-body p-4">
                    <div className="service-icon mb-3">
                      <Icon size={20} />
                    </div>
                    <h3 className="h6">{service.title}</h3>
                    <p className="text-secondary small mb-0">{service.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
