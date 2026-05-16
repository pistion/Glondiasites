import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { mediaFiles } from '../../data/dashboardMockData.js'

export default function MediaPage() {
  const [selectedFile, setSelectedFile] = useState(mediaFiles[0])
  const [notice, setNotice] = useState('')

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Media library" title="Manage uploaded visual assets" description="Organize logos, banners, product images, and supporting documents for the storefront build." actionLabel="Add asset" onAction={() => setNotice('Asset upload request recorded locally for the next media sync.')} />
      {notice ? <div className="alert alert-success">{notice}</div> : null}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm dashboard-panel">
            <div className="card-body p-4">
              {mediaFiles.length ? (
                <div className="row g-3">
                  {mediaFiles.map((file) => (
                    <div className="col-md-4" key={file.id}>
                      <button className="media-card text-start w-100" onClick={() => setSelectedFile(file)} type="button">
                        <div className="media-surface rounded-3 mb-3" />
                        <div className="fw-medium">{file.name}</div>
                        <div className="small text-secondary">{file.type}</div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState description="Upload assets when the project is ready for brand and product media." title="No media files yet" />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm dashboard-panel h-100">
            <div className="card-body p-4" key={selectedFile.id}>
              <h2 className="h5 mb-3">Asset details</h2>
              <ul className="list-unstyled mb-0 d-grid gap-2">
                <li><strong>File name:</strong> {selectedFile.name}</li>
                <li><strong>File type:</strong> {selectedFile.type}</li>
                <li><strong>Size:</strong> {selectedFile.size}</li>
                <li><strong>Used on:</strong> {selectedFile.usedOn}</li>
                <li><strong>Uploaded:</strong> {selectedFile.uploadedAt}</li>
              </ul>
              <label className="form-label mt-4">Alt text</label>
              <input className="form-control" defaultValue={`${selectedFile.name} alt text`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
