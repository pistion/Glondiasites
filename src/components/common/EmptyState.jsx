export default function EmptyState({ title, description, action }) {
  return (
    <div className="border rounded-3 bg-white p-4 text-center">
      <h3 className="h6 mb-2">{title}</h3>
      <p className="text-secondary mb-3">{description}</p>
      {action}
    </div>
  )
}
