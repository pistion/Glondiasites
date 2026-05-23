import React from 'react';
import { ICN } from './icons';
import { Badge, Tabs, Empty } from './components';
import { useActivity, useAudit } from './use-activity';

export function ActivityPage() {
  const [tab, setTab] = React.useState('Activity');
  const activity = useActivity(100);
  const audit = useAudit(100);
  const current = tab === 'Activity' ? activity : audit;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Workspace</div>
          <h1>Activity log</h1>
          <p className="sub">Review workspace events and security-relevant audit entries.</p>
        </div>
        <Tabs value={tab} onChange={setTab} options={["Activity", "Audit"]} />
      </div>

      {current.source === "api" && (
        <div className="card" style={{ padding: "10px 14px", fontSize: 13 }}>
          <span className="row" style={{ gap: 8 }}><ICN.Server size={14} /> Connected to backend {tab.toLowerCase()} API</span>
        </div>
      )}
      {current.error && (
        <div className="card" style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-muted)" }}>
          Backend unavailable or permission denied, showing prototype activity.
        </div>
      )}

      <div className="card card-flush">
        <div className="card-head">
          <h2>{tab}</h2>
          <span className="meta">{current.items.length} events</span>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Event</th><th>Actor</th><th>Kind</th><th>When</th><th>Entity</th></tr>
          </thead>
          <tbody>
            {current.loading ? (
              <tr><td colSpan={5}>Loading events...</td></tr>
            ) : current.items.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <Empty icon="Activity" title="No events yet"
                    body="Workspace actions will be recorded here as your team works." />
                </td>
              </tr>
            ) : current.items.map((item) => (
              <tr key={item.id}>
                <td>{item.what}</td>
                <td>{item.who}</td>
                <td><Badge tone={item.kind === "deploy" ? "success" : item.kind === "domain" ? "info" : "muted"} dot={false}>{item.kind}</Badge></td>
                <td>{item.when}</td>
                <td className="mono">{[item.entityType, item.entityId].filter(Boolean).join(':') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
