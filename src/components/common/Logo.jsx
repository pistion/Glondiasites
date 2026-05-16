import { Store } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ compact = false, to = '/' }) {
  return (
    <Link className={`logo text-decoration-none ${compact ? 'logo-compact' : ''}`} to={to}>
      <span className="logo-mark">
        <Store size={compact ? 18 : 20} strokeWidth={2} />
      </span>
      <span className="logo-copy">
        <span className="logo-title">Glondia</span>
        <span className="logo-subtitle">Ecommerce Website Services</span>
      </span>
    </Link>
  )
}
