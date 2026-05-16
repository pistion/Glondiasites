import { useState } from 'react'
import SectionHeader from '../../../components/common/SectionHeader.jsx'
import { featureGroups } from '../../../data/publicContent.js'

export default function EcommerceFeatureTabs() {
  const [activeKey, setActiveKey] = useState(featureGroups[0].key)
  const activeGroup = featureGroups.find((group) => group.key === activeKey) || featureGroups[0]

  return (
    <section className="py-5 bg-white">
      <div className="container-xl">
        <SectionHeader
          description="Storefront, catalog, marketing, and operations screens are planned together so the project stays connected."
          title="Built Around Real Ecommerce Needs"
        />
        <div className="row g-4 align-items-start">
          <div className="col-lg-4">
            <div className="nav flex-column nav-pills gap-2">
              {featureGroups.map((group) => (
                <button
                  className={`nav-link text-start ${group.key === activeKey ? 'active' : ''}`}
                  key={group.key}
                  onClick={() => setActiveKey(group.key)}
                  type="button"
                >
                  {group.title}
                </button>
              ))}
            </div>
          </div>
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="h5 mb-3">{activeGroup.title}</h3>
                <div className="row g-3">
                  {activeGroup.items.map((item) => (
                    <div className="col-md-6" key={item}>
                      <div className="border rounded-3 p-3 h-100">
                        <div className="fw-medium">{item}</div>
                        <div className="small text-secondary mt-1">Prepared as part of the connected frontend workspace.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
