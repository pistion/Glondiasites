const statusMap = {
  active: 'success',
  archive: 'secondary',
  closed: 'secondary',
  connected: 'success',
  draft: 'secondary',
  high: 'danger',
  'in progress': 'warning',
  low: 'secondary',
  medium: 'warning',
  open: 'primary',
  'not started': 'secondary',
  paid: 'success',
  pending: 'warning',
  placeholder: 'secondary',
  preparing: 'warning',
  preview: 'info',
  queued: 'secondary',
  ready: 'success',
  reserved: 'warning',
  success: 'success',
  visible: 'success',
  'waiting reply': 'warning',
  'needs review': 'warning',
  'not required': 'secondary',
  'pending setup': 'warning',
  invited: 'info',
}

export default function StatusBadge({ value }) {
  const normalized = String(value).trim().toLowerCase()
  const variant = statusMap[normalized] || 'secondary'

  return <span className={`badge text-bg-${variant} fw-medium`}>{value}</span>
}
