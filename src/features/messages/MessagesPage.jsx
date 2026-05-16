import { useMemo, useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { activeProject, messages, messageThreads } from '../../data/dashboardMockData.js'

export default function MessagesPage() {
  const [selectedMessageId, setSelectedMessageId] = useState(messages[0].id)
  const [reply, setReply] = useState('')
  const [threadState, setThreadState] = useState(messageThreads)

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedMessageId) || messages[0],
    [selectedMessageId],
  )

  const selectedThread = threadState[selectedMessageId] || []

  return (
    <div className="d-grid gap-4">
      <PageHeader eyebrow="Messages" title="Client and team communication" description="Keep project updates, design feedback, content requests, and support questions in one threaded workspace." />
      <div className="card border-0 shadow-sm dashboard-panel message-layout">
        <div className="row g-0 h-100">
          <div className="col-lg-3 border-end">
            <div className="p-3 border-bottom fw-semibold">Conversations</div>
            <div className="list-group list-group-flush">
              {messages.map((message) => (
                <button
                  className={`list-group-item list-group-item-action ${selectedMessageId === message.id ? 'active' : ''}`}
                  key={message.id}
                  onClick={() => setSelectedMessageId(message.id)}
                  type="button"
                >
                  <div className="d-flex justify-content-between gap-2">
                    <div>
                      <div className="fw-medium">{message.subject}</div>
                      <div className="small opacity-75">{message.sender}</div>
                    </div>
                    {message.unread ? <span className="badge text-bg-success">New</span> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-lg-6 border-end d-flex flex-column">
            <div className="p-3 border-bottom">
              <div className="fw-semibold">{selectedMessage.subject}</div>
              <div className="small text-secondary">{selectedMessage.category}</div>
            </div>
            <div className="flex-grow-1 p-3 message-thread">
              {selectedThread.map((item) => (
                <div className={`message-bubble ${item.type === 'client' ? 'message-bubble-client' : 'message-bubble-team'}`} key={item.id}>
                  <div className="fw-medium small mb-1">{item.author}</div>
                  <div>{item.text}</div>
                  <div className="small text-secondary mt-2">{item.time}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-top">
              <textarea className="form-control mb-3" onChange={(event) => setReply(event.target.value)} placeholder="Reply to this conversation" rows="3" value={reply} />
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    if (!reply.trim()) {
                      return
                    }

                    const nextItem = {
                      id: Date.now(),
                      author: 'You',
                      type: 'client',
                      text: reply.trim(),
                      time: 'Just now',
                    }

                    setThreadState({
                      ...threadState,
                      [selectedMessageId]: [...selectedThread, nextItem],
                    })
                    setReply('')
                  }}
                  type="button"
                >
                  Send reply
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-3">
            <div className="p-3 border-bottom fw-semibold">Project context</div>
            <div className="p-3 d-grid gap-3">
              <div><div className="small text-secondary">Active project</div><div className="fw-medium">{activeProject.name}</div></div>
              <div><div className="small text-secondary">Category</div><div className="fw-medium">{selectedMessage.category}</div></div>
              <div><div className="small text-secondary">Current status</div><StatusBadge value={activeProject.status} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
