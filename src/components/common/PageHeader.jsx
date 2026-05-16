export default function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}) {
  return (
    <div className="page-header d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">
      <div>
        {eyebrow ? <div className="page-eyebrow text-uppercase text-success fw-semibold small mb-2">{eyebrow}</div> : null}
        <h1 className="h2 mb-2">{title}</h1>
        {description ? <p className="text-secondary mb-0 page-description">{description}</p> : null}
      </div>
      {actionLabel ? (
        <button className="btn btn-success" onClick={onAction} type="button">
          {ActionIcon ? <ActionIcon className="me-2" size={18} /> : null}
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
