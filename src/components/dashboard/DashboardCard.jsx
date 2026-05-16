export default function DashboardCard({ label, value, detail }) {
  return (
    <div className="card border-0 shadow-sm h-100 dashboard-panel">
      <div className="card-body p-3">
        <div className="text-secondary small mb-2">{label}</div>
        <div className="h4 mb-1">{value}</div>
        <div className="small text-secondary">{detail}</div>
      </div>
    </div>
  )
}
