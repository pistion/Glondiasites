export default function SectionHeader({ title, description, action }) {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
      <div>
        <h2 className="h5 mb-1">{title}</h2>
        {description ? <p className="text-secondary small mb-0">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
