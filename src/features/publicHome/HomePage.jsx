import HomeHero from './components/HomeHero.jsx'
import ServiceOverview from './components/ServiceOverview.jsx'
import ProcessSection from './components/ProcessSection.jsx'
import EcommerceFeatureTabs from './components/EcommerceFeatureTabs.jsx'
import DashboardPreview from './components/DashboardPreview.jsx'
import PricingIntro from './components/PricingIntro.jsx'
import PortfolioPreview from './components/PortfolioPreview.jsx'
import SupportCta from './components/SupportCta.jsx'

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ServiceOverview />
      <ProcessSection />
      <EcommerceFeatureTabs />
      <DashboardPreview />
      <PricingIntro />
      <PortfolioPreview />
      <SupportCta />
    </>
  )
}
