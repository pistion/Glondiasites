import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layout/PublicLayout.jsx'
import DashboardLayout from './layout/DashboardLayout.jsx'
import HomePage from '../features/publicHome/HomePage.jsx'
import ServicesPage from '../features/publicServices/ServicesPage.jsx'
import PortfolioPage from '../features/publicPortfolio/PortfolioPage.jsx'
import PricingPage from '../features/publicPricing/PricingPage.jsx'
import ProcessPage from '../features/publicProcess/ProcessPage.jsx'
import SupportPage from '../features/publicSupport/SupportPage.jsx'
import ContactPage from '../features/publicContact/ContactPage.jsx'
import LoginPage from '../features/auth/LoginPage.jsx'
import SignupPage from '../features/auth/SignupPage.jsx'
import DashboardOverview from '../features/dashboardOverview/DashboardOverview.jsx'
import ProjectsPage from '../features/projects/ProjectsPage.jsx'
import ProjectDetailPage from '../features/projects/ProjectDetailPage.jsx'
import StorefrontPage from '../features/storefront/StorefrontPage.jsx'
import ProductsPage from '../features/products/ProductsPage.jsx'
import CategoriesPage from '../features/categories/CategoriesPage.jsx'
import OrdersUiPage from '../features/ordersUi/OrdersUiPage.jsx'
import CustomersUiPage from '../features/customersUi/CustomersUiPage.jsx'
import PagesPage from '../features/pages/PagesPage.jsx'
import SeoPage from '../features/seo/SeoPage.jsx'
import MediaPage from '../features/media/MediaPage.jsx'
import DomainsPage from '../features/domains/DomainsPage.jsx'
import HostingPage from '../features/hosting/HostingPage.jsx'
import AnalyticsPage from '../features/analytics/AnalyticsPage.jsx'
import MessagesPage from '../features/messages/MessagesPage.jsx'
import TicketsPage from '../features/tickets/TicketsPage.jsx'
import BillingPage from '../features/billing/BillingPage.jsx'
import AccountPage from '../features/account/AccountPage.jsx'
import SettingsPage from '../features/settings/SettingsPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>

      <Route path="dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="storefront" element={<StorefrontPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders-ui" element={<OrdersUiPage />} />
        <Route path="customers-ui" element={<CustomersUiPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="seo" element={<SeoPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="domains" element={<DomainsPage />} />
        <Route path="hosting" element={<HostingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
