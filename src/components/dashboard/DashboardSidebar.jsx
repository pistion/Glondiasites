import {
  BarChart3,
  CreditCard,
  FolderKanban,
  Globe,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  MessageSquareText,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  UserCircle2,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Logo from '../common/Logo.jsx'

export const dashboardSections = [
  {
    title: 'Main',
    items: [
      { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
      { label: 'Projects', to: '/dashboard/projects', icon: FolderKanban },
      { label: 'Storefront', to: '/dashboard/storefront', icon: LayoutTemplate },
    ],
  },
  {
    title: 'Ecommerce',
    items: [
      { label: 'Products', to: '/dashboard/products', icon: Package },
      { label: 'Categories', to: '/dashboard/categories', icon: ShoppingCart },
      { label: 'Orders UI', to: '/dashboard/orders-ui', icon: ShoppingCart },
      { label: 'Customers UI', to: '/dashboard/customers-ui', icon: Users },
      { label: 'Pages', to: '/dashboard/pages', icon: LayoutTemplate },
      { label: 'SEO & Metadata', to: '/dashboard/seo', icon: Globe },
      { label: 'Media Library', to: '/dashboard/media', icon: Image },
    ],
  },
  {
    title: 'Website Setup',
    items: [
      { label: 'Domains', to: '/dashboard/domains', icon: Globe },
      { label: 'Hosting', to: '/dashboard/hosting', icon: Globe },
      { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messages', to: '/dashboard/messages', icon: Mail },
      { label: 'Tickets', to: '/dashboard/tickets', icon: Ticket },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Billing', to: '/dashboard/billing', icon: CreditCard },
      { label: 'Account', to: '/dashboard/account', icon: UserCircle2 },
      { label: 'Settings', to: '/dashboard/settings', icon: Settings },
    ],
  },
]

export const dashboardRouteLabels = dashboardSections
  .flatMap((section) => section.items)
  .reduce((accumulator, item) => {
    accumulator[item.to] = item.label
    return accumulator
  }, {})

export default function DashboardSidebar() {
  return (
    <div className="w-100 h-100 d-flex flex-column">
      <div className="p-3 p-lg-4 border-bottom border-secondary-subtle">
        <Logo compact to="/" />
      </div>
      <div className="flex-grow-1 overflow-auto p-3">
        {dashboardSections.map((section) => (
          <div className="mb-4" key={section.title}>
            <div className="dashboard-nav-title px-3 mb-2">{section.title}</div>
            <div className="nav flex-column gap-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    className={({ isActive }) => `dashboard-nav-link ${isActive ? 'active' : ''}`}
                    data-bs-dismiss="offcanvas"
                    end={item.end}
                    key={item.to}
                    to={item.to}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-top border-secondary-subtle">
        <div className="dashboard-sidebar-help rounded-3 p-3">
          <div className="fw-semibold mb-1">Need help?</div>
          <div className="small text-white-50 mb-3">Use messages or support tickets to keep requests tied to your active project.</div>
          <NavLink className="btn btn-sm btn-success w-100" to="/dashboard/tickets">
            <MessageSquareText className="me-2" size={16} />
            Open support
          </NavLink>
        </div>
      </div>
    </div>
  )
}
