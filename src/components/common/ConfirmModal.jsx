export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
}) {
  return (
    <div className="app-modal-backdrop">
      <div className="app-modal card shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 mb-2">{title}</h2>
          <p className="text-secondary mb-4">{description}</p>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary" onClick={onCancel} type="button">
              {cancelLabel}
            </button>
            <button className="btn btn-danger" onClick={onConfirm} type="button">
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
