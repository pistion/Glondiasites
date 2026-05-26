import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ICN } from './icons';
import { Badge, Empty, StatusBadge, Tabs } from './components';
import {
  addHostingDomain,
  attachHostingDisk,
  deleteHostingDisk,
  captureHostingPayPalOrder,
  createHostingPayPalOrder,
  deleteHostingDeployment,
  deleteHostingDomain,
  deleteHostingEnvVar,
  getDeploymentLogStreamUrl,
  getGitHubStatus,
  getHostingPaymentStatus,
  getHostingService,
  getPayPalClientSettings,
  getRenderDeploymentStatus,
  getRenderSettings,
  listHostingDeployments,
  listHostingDomains,
  listHostingEnvVars,
  redeployRenderDeployment,
  suspendHostingDeployment,
  syncHostingEnvVars,
  updateHostingEnvVar,
  upsertHostingEnvVar,
  verifyHostingDomain,
  verifyRenderDeploymentUrl,
} from './api';
import { isLiveMode } from './app/config.js';

export function HostingList({ navigate }) {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [tab, setTab]       = useState('apps');

  useEffect(() => {
    let cancelled = false;
    listHostingDeployments()
      .then((items) => { if (!cancelled) setApps(items || []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Hosting apps could not be loaded.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Hosting</div>
          <h1>Render Hosting</h1>
          <p className="sub">Deploy and manage web apps on Render — linked to GitHub, imported from ZIP, or built with the Site Builder.</p>
        </div>
        <div className="actions">
          {tab === 'apps' && (
            <>
              <button className="btn btn-outline" onClick={() => navigate({ view: 'builder-gallery' })}>
                <ICN.Layers size={14} /> Site builder
              </button>
              <button className="btn btn-primary" onClick={() => navigate({ view: 'builder-import', params: { mode: 'github' } })}>
                <ICN.Git size={14} /> Deploy from GitHub
              </button>
            </>
          )}
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        options={[
          { value: 'apps',     label: 'My apps' },
          { value: 'settings', label: 'Settings' },
        ]}
      />

      {tab === 'apps' ? (
        <>
          {error && <div className="card" style={{ padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

          {loading ? (
            <div className="card" style={{ padding: '42px 24px' }}>
              <Empty icon="Server" title="Loading hosting apps..." />
            </div>
          ) : apps.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px' }}>
              <Empty
                icon="Server"
                title="No hosted apps yet"
                body="Deploy from GitHub or build with the Site Builder to create your first hosting app."
                action={
                  <div className="row" style={{ gap: 10 }}>
                    <button className="btn btn-outline" onClick={() => navigate({ view: 'builder-gallery' })}>
                      <ICN.Layers size={14} /> Site builder
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate({ view: 'builder-import', params: { mode: 'github' } })}>
                      <ICN.Git size={14} /> Deploy from GitHub
                    </button>
                  </div>
                }
              />
            </div>
          ) : (
            <div className="grid-2">
              {apps.map((app) => <HostingAppCard key={app.deploymentId} app={app} navigate={navigate} />)}
            </div>
          )}
        </>
      ) : (
        <HostingSettings />
      )}
    </>
  );
}

function HostingAppCard({ app, navigate }) {
  const building = Boolean(app.renderServiceId) && ['preparing', 'queued', 'building', 'deploying', 'verifying'].includes(app.status);
  return (
    <button
      type="button"
      className="card"
      onClick={() => navigate({ view: 'hosting-detail', params: { id: app.deploymentId } })}
      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14, color: 'inherit' }}
    >
      <div className="row between">
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <span className="proj-thumb" style={{ width: 40, height: 40, fontSize: 15 }}>{(app.serviceName || 'A')[0]}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{app.serviceName}</div>
            <div className="mono faint" style={{ fontSize: 12 }}>{app.githubRepo || app.sourceReference || app.renderServiceId || app.deploymentId}</div>
          </div>
        </div>
        <StatusBadge value={statusLabel(app.status)} />
      </div>
      {building && <DeploymentPulse compact />}
      <div className="kv" style={{ gridTemplateColumns: '110px 1fr', gap: '6px 14px' }}>
        <dt>Step</dt><dd>{app.currentStep || statusLabel(app.status)}</dd>
        <dt>Build</dt><dd className="mono">{app.buildStatus || 'pending'}</dd>
        <dt>Live URL</dt><dd className="mono">{app.liveUrl ? app.liveUrl.replace(/^https?:\/\//, '') : 'Pending'}</dd>
        <dt>Branch</dt><dd className="mono">{app.githubBranch || app.environmentConfiguration?.branch || 'main'}</dd>
        <dt>Last deploy</dt><dd>{formatDate(app.lastDeployedAt || app.updatedAt)}</dd>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {app.liveUrl && (
          <a className="btn btn-sm btn-outline" href={app.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <ICN.ExternalLink size={13} /> View Live Site
          </a>
        )}
        <span className="btn btn-sm btn-primary">Manage</span>
      </div>
    </button>
  );
}

export function HostingDetail({ id, navigate }) {
  const deploymentId = id;
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');

  const load = async () => {
    const [hosting, nextStatus] = await Promise.all([
      getHostingService(deploymentId),
      getRenderDeploymentStatus(deploymentId).catch(() => null),
    ]);
    setApp(hosting);
    setStatus(nextStatus);
  };

  useEffect(() => {
    let cancelled = false;
    const run = () => load().catch((err) => { if (!cancelled) setError(err.message || 'Hosting app could not be loaded.'); }).finally(() => { if (!cancelled) setLoading(false); });
    run();
    const interval = setInterval(run, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [deploymentId]);

  const merged = useMemo(() => ({ ...(app || {}), ...(status || {}) }), [app, status]);
  const isLive = merged.status === 'live';
  const isFailed = merged.status === 'failed';
  const isUnverified = merged.status === 'deployed_unverified';
  const isDeleted = merged.status === 'deleted';

  const runAction = async (name, fn) => {
    setBusy(name);
    setError('');
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setBusy('');
    }
  };

  if (loading) return <div className="card" style={{ padding: 42 }}><Empty icon="Server" title="Loading hosting app..." /></div>;
  if (!app) return <div className="card" style={{ padding: 42 }}><Empty icon="AlertCircle" title="Hosting app not found" action={<button className="btn btn-outline" onClick={() => navigate({ view: 'hosting-list' })}>Back to Hosting</button>} /></div>;

  return (
    <>
      <div className="page-head">
        <div>
          <button className="page-eyebrow" style={{ background: 'none', border: 0, padding: 0, color: 'var(--text-muted)' }} onClick={() => navigate({ view: 'hosting-list' })}>Back to Hosting</button>
          <div className="row" style={{ gap: 14, marginTop: 8 }}>
            <span className="proj-thumb" style={{ width: 44, height: 44, fontSize: 16 }}>{(app.serviceName || 'A')[0]}</span>
            <div>
              <h1 style={{ margin: 0 }}>{app.serviceName}</h1>
              <div className="row" style={{ gap: 10, marginTop: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                <span className="mono">{app.renderServiceId || app.deploymentId}</span>
                <span>·</span>
                <StatusBadge value={statusLabel(merged.status)} />
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          {merged.liveUrl && <a className="btn btn-outline" href={merged.liveUrl} target="_blank" rel="noopener noreferrer"><ICN.ExternalLink size={14} /> View Live Site</a>}
          {merged.liveUrl && <button className="btn btn-outline" onClick={() => navigator.clipboard?.writeText(merged.liveUrl)}><ICN.Copy size={14} /> Copy URL</button>}
          <button className="btn btn-primary" disabled={!!busy || isDeleted} onClick={() => runAction('redeploy', () => redeployRenderDeployment(deploymentId))}><ICN.Refresh size={14} /> Redeploy</button>
        </div>
      </div>

      {error && <div className="card" style={{ padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

      <div className="grid-side">
        <DeploymentStatusPanel app={merged} isLive={isLive} isFailed={isFailed} isUnverified={isUnverified} onVerify={() => runAction('verify', () => verifyRenderDeploymentUrl(deploymentId))} busy={busy} />
        <AdminPanel
          app={merged}
          busy={busy}
          onSuspend={() => window.confirm('Suspend this site?') && runAction('suspend', () => suspendHostingDeployment(deploymentId))}
          onDelete={() => window.confirm('Delete this hosted site? This cannot be undone.') && runAction('delete', async () => {
            await deleteHostingDeployment(deploymentId);
            navigate({ view: 'hosting-list' });
          })}
        />
      </div>

      <Tabs value={tab} onChange={setTab} options={['Overview', 'Billing', 'Environment Variables', 'Persistent Disk', 'Domains', 'Build Logs', 'Render Settings']} />

      {tab === 'Overview' && <OverviewTab app={merged} deploymentId={deploymentId} />}
      {tab === 'Billing' && <BillingTab deploymentId={deploymentId} />}
      {tab === 'Environment Variables' && <EnvironmentTab deploymentId={deploymentId} onChanged={load} />}
      {tab === 'Persistent Disk' && <DiskTab deploymentId={deploymentId} app={merged} onChanged={load} />}
      {tab === 'Domains' && <DomainsTab deploymentId={deploymentId} onChanged={load} />}
      {tab === 'Build Logs' && <LiveLogsPanel deploymentId={deploymentId} />}
      {tab === 'Render Settings' && <RenderSettingsTab app={merged} />}
    </>
  );
}

function DeploymentStatusPanel({ app, isLive, isFailed, isUnverified, onVerify, busy }) {
  const hasRenderService = Boolean(app.renderServiceId);
  const shouldAnimate = hasRenderService && ['preparing', 'queued', 'building', 'deploying', 'verifying'].includes(app.status);
  return (
    <div className="card">
      <div className="row between">
        <div>
          <div className="page-eyebrow" style={{ marginBottom: 6 }}>Deployment status</div>
          <h2 style={{ margin: 0 }}>{statusLabel(app.status)}</h2>
        </div>
        <StatusBadge value={statusLabel(app.status)} />
      </div>
      {!hasRenderService && <RenderNotStartedBlock app={app} />}
      {shouldAnimate && <DeploymentPulse />}
      {isFailed && <FailureBlock app={app} />}
      {isLive && <SuccessBlock app={app} />}
      {isUnverified && <WarmingBlock app={app} />}
      <div className="kv" style={{ marginTop: 16, gridTemplateColumns: '150px 1fr' }}>
        <dt>Current step</dt><dd>{app.currentStep || statusLabel(app.status)}</dd>
        <dt>Build status</dt><dd className="mono">{app.buildStatus || 'pending'}</dd>
        <dt>Service status</dt><dd>{hasRenderService ? app.status || 'preparing' : 'Render deployment not started'}</dd>
        <dt>URL verification</dt><dd>{app.urlReachable ? 'Reachable' : app.liveUrl ? 'Warming up' : 'Pending URL'}</dd>
      </div>
      {app.liveUrl && !app.urlReachable && (
        <button className="btn btn-sm btn-outline" style={{ marginTop: 14 }} onClick={onVerify} disabled={busy === 'verify'}>
          <ICN.Refresh size={13} /> Retry URL verification
        </button>
      )}
      <div style={{ marginTop: 16 }}>
        <div className="label" style={{ marginBottom: 6 }}>Recent activity</div>
        <div className="muted" style={{ fontSize: 12 }}>Open the <strong>Build Logs</strong> tab for the live log stream.</div>
      </div>
    </div>
  );
}

function RenderNotStartedBlock({ app }) {
  return (
    <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--warning)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}>
      <div className="row" style={{ gap: 8, color: 'var(--warning)', fontWeight: 700 }}><ICN.AlertCircle size={16} /> Render deployment not started</div>
      <div className="muted" style={{ marginTop: 8 }}>{app.errorMessage || 'Render has not returned a real service ID yet. Check Render credentials and retry deployment.'}</div>
    </div>
  );
}

function DeploymentPulse({ compact = false }) {
  return (
    <div style={{ marginTop: compact ? 0 : 18, display: 'grid', gap: 8 }}>
      <div style={{ height: compact ? 6 : 8, borderRadius: 999, background: 'var(--bg-deep)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '42%', background: 'var(--accent)', borderRadius: 999, animation: 'pulse 1.2s ease-in-out infinite' }} />
      </div>
      {!compact && <div className="muted" style={{ fontSize: 13 }}>Preparing, sending to Render, building, deploying, then verifying the live URL.</div>}
    </div>
  );
}

function SuccessBlock({ app }) {
  return (
    <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}>
      <div className="row" style={{ gap: 8, color: 'var(--accent)', fontWeight: 700 }}><ICN.CheckCircle size={16} /> Deployment is live</div>
      <div className="mono" style={{ marginTop: 8, wordBreak: 'break-all' }}>{app.liveUrl}</div>
    </div>
  );
}

function WarmingBlock({ app }) {
  return (
    <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--warning)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}>
      <div className="row" style={{ gap: 8, color: 'var(--warning)', fontWeight: 700 }}><ICN.Refresh size={16} /> Deployed, still warming up</div>
      <div className="mono" style={{ marginTop: 8, wordBreak: 'break-all' }}>{app.liveUrl || 'URL pending from Render'}</div>
    </div>
  );
}

function FailureBlock({ app }) {
  return (
    <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--danger)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}>
      <div className="row" style={{ gap: 8, color: 'var(--danger)', fontWeight: 700 }}><ICN.AlertCircle size={16} /> Deployment failed</div>
      <div className="muted" style={{ marginTop: 8 }}>{app.errorMessage || 'Review logs and settings, then redeploy.'}</div>
    </div>
  );
}

function AdminPanel({ app, busy, onSuspend, onDelete }) {
  const hasRenderService = Boolean(app.renderServiceId);
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Admin controls</h2>
      <div className="kv" style={{ gridTemplateColumns: '140px 1fr', marginBottom: 16 }}>
        <dt>Deployment ID</dt><dd className="mono">{app.deploymentId}</dd>
        <dt>Render deploy</dt><dd className="mono">{app.renderDeployId || 'Pending'}</dd>
        <dt>Created</dt><dd>{formatDate(app.createdAt)}</dd>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        <button className="btn btn-outline" disabled={!hasRenderService || busy === 'suspend' || app.status === 'suspended' || app.status === 'deleted'} onClick={onSuspend}><ICN.Power size={14} /> Suspend Site</button>
        <button className="btn btn-danger" disabled={!hasRenderService || busy === 'delete' || app.status === 'deleted'} onClick={onDelete}><ICN.Trash size={14} /> Delete Site</button>
      </div>
    </div>
  );
}

function OverviewTab({ app, deploymentId }) {
  return (
    <div className="grid-side">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Hosting app</h2>
        <div className="kv">
          <dt>Repository</dt><dd className="mono">{app.githubRepo || app.repoUrl || 'Builder source'}</dd>
          <dt>Branch</dt><dd className="mono">{app.githubBranch || app.environmentConfiguration?.branch || 'main'}</dd>
          <dt>Service type</dt><dd><Badge tone="info" dot={false}>{app.serviceType}</Badge></dd>
          <dt>Live URL</dt><dd className="mono">{app.liveUrl || 'Pending'}</dd>
        </div>
      </div>
      <LiveLogsPanel deploymentId={deploymentId} compact />
    </div>
  );
}

function EnvironmentTab({ deploymentId, onChanged }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ key: '', value: '', secret: true, environment: 'production' });
  const [editing, setEditing] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const load = () => listHostingEnvVars(deploymentId).then((items) => setRows(items || []));
  useEffect(() => { load().catch(() => setRows([])); }, [deploymentId]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editing) await updateHostingEnvVar(deploymentId, editing, form);
      else await upsertHostingEnvVar(deploymentId, form);
      setForm({ key: '', value: '', secret: true, environment: 'production' });
      setEditing('');
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid-side">
      <form className="card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Environment variables</h2>
        <div className="grid-2">
          <div><label className="label">Key</label><input className="input mono" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} disabled={!!editing} /></div>
          <div><label className="label">Value</label><input className="input mono" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <div><label className="label">Environment</label><select className="select" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}><option>production</option><option>preview</option><option>development</option></select></div>
          <label className="row" style={{ gap: 8, alignItems: 'center', marginTop: 24 }}><input type="checkbox" checked={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.checked })} /> Secret / encrypted</label>
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</div>}
        <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
          <button type="button" className="btn btn-outline" onClick={() => syncHostingEnvVars(deploymentId).then(load).then(onChanged)}><ICN.Refresh size={14} /> Sync to Render</button>
          <button className="btn btn-primary" disabled={isSaving}>{isSaving ? '···' : (editing ? 'Save variable' : 'Add variable')}</button>
        </div>
      </form>
      <div className="card card-flush">
        <div className="card-head"><h2>Stored variables</h2><span className="meta">{rows.length} keys</span></div>
        <table className="tbl"><thead><tr><th>Key</th><th>Value</th><th>Scope</th><th>Sync</th><th></th></tr></thead><tbody>
          {rows.length === 0 ? <tr><td colSpan={5}>No environment variables yet.</td></tr> : rows.map((row) => (
            <tr key={row.key}>
              <td className="mono">{row.key}</td><td className="mono">{row.valuePreview || '********'}</td><td>{row.environment}</td><td>{row.renderSynced ? 'Synced' : 'Pending'}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn-sm btn-ghost" onClick={() => { setEditing(row.key); setForm({ key: row.key, value: '', secret: row.encrypted !== false, environment: row.environment || 'production' }); }}><ICN.Edit size={13} /></button>
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => deleteHostingEnvVar(deploymentId, row.key).then(load).then(onChanged)}><ICN.Trash size={13} /></button>
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function DiskTab({ deploymentId, app, onChanged }) {
  const [form, setForm] = useState({ name: 'data', mountPath: '/var/data', sizeGB: 1 });
  const [isAttaching, setIsAttaching] = useState(false);
  const [error, setError] = useState('');
  const disks = app.diskMetadata || [];
  const supported = app.serviceType === 'web_service';

  const attachDisk = async (event) => {
    event.preventDefault();
    setError('');
    setIsAttaching(true);
    try {
      await attachHostingDisk(deploymentId, form);
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div className="grid-side">
      <form className="card" onSubmit={attachDisk}>
        <h2 style={{ marginTop: 0 }}>SSD / persistent disk</h2>
        {!supported && <div className="muted" style={{ color: 'var(--warning)', marginBottom: 12 }}>Persistent disks are not supported for this Render service type.</div>}
        <div className="grid-2">
          <div><label className="label">Disk name</label><input className="input mono" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Disk size (GB)</label><input className="input mono" type="number" min="1" max="1024" value={form.sizeGB} onChange={(e) => setForm({ ...form, sizeGB: Number(e.target.value) })} /></div>
          <div><label className="label">Mount path</label><input className="input mono" value={form.mountPath} onChange={(e) => setForm({ ...form, mountPath: e.target.value })} /></div>
        </div>
        {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</div>}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn btn-primary" disabled={!supported || isAttaching}>{isAttaching ? '···' : 'Attach disk'}</button></div>
      </form>
      <div className="card card-flush">
        <div className="card-head"><h2>Configured disks</h2><span className="meta">{disks.length} items</span></div>
        <table className="tbl"><thead><tr><th>Name</th><th>Mount</th><th>Size</th><th>Status</th><th></th></tr></thead><tbody>
          {disks.length === 0 ? <tr><td colSpan={5}>No persistent disk configured.</td></tr> : disks.map((row) => (
            <tr key={row.diskId || row.name}>
              <td className="mono">{row.name}</td><td className="mono">{row.mountPath}</td><td>{row.sizeGB} GB</td><td>{row.status}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => deleteHostingDisk(deploymentId, row.diskId).then(onChanged)}><ICN.Trash size={13} /></button>
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

function DomainsTab({ deploymentId, onChanged }) {
  const [domain, setDomain] = useState('');
  const [items, setItems] = useState([]);
  const load = () => listHostingDomains(deploymentId).then((rows) => setItems(rows || []));
  useEffect(() => { load().catch(() => setItems([])); }, [deploymentId]);
  return (
    <div className="grid-side">
      <form className="card" onSubmit={(event) => { event.preventDefault(); addHostingDomain(deploymentId, { domain }).then(() => { setDomain(''); return load(); }).then(onChanged); }}>
        <h2 style={{ marginTop: 0 }}>Custom domains</h2>
        <label className="label">Domain name</label>
        <div className="row" style={{ gap: 8 }}><input className="input mono" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} /><button className="btn btn-primary">Add domain</button></div>
      </form>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.length === 0 ? <div className="card"><Empty icon="Globe" title="No domains connected" /></div> : items.map((item) => (
          <div className="card" key={item.domainId}>
            <div className="row between"><div><div className="mono" style={{ fontWeight: 700 }}>{item.name}</div><div className="muted" style={{ fontSize: 13 }}>DNS {item.verificationStatus} · SSL {item.sslStatus}</div></div><div className="row" style={{ gap: 6 }}><button className="btn btn-sm btn-outline" onClick={() => verifyHostingDomain(deploymentId, item.domainId).then(load).then(onChanged)}>Retry verification</button><button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => deleteHostingDomain(deploymentId, item.domainId).then(load).then(onChanged)}><ICN.Trash size={13} /></button></div></div>
            <table className="tbl" style={{ marginTop: 12 }}><thead><tr><th>Type</th><th>Name</th><th>Value</th></tr></thead><tbody>{(item.dnsRecords || []).map((record, index) => <tr key={index}><td>{record.type}</td><td className="mono">{record.name}</td><td className="mono">{record.value}</td></tr>)}</tbody></table>
          </div>
        ))}
      </div>
    </div>
  );
}

function RenderSettingsTab({ app }) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Render service settings</h2>
      <div className="kv">
        <dt>Service ID</dt><dd className="mono">{app.renderServiceId || 'Pending'}</dd>
        <dt>Service type</dt><dd>{app.serviceType}</dd>
        <dt>Build command</dt><dd className="mono">{app.environmentConfiguration?.buildCommand || 'Not set'}</dd>
        <dt>Start command</dt><dd className="mono">{app.environmentConfiguration?.startCommand || 'Not set'}</dd>
        <dt>Output directory</dt><dd className="mono">{app.environmentConfiguration?.outputDirectory || 'Not set'}</dd>
      </div>
    </div>
  );
}

// ── Live log stream panel ─────────────────────────────────────────────────────

function LiveLogsPanel({ deploymentId, compact = false }) {
  const [lines, setLines] = useState([]);
  const [streamStatus, setStreamStatus] = useState(null);
  const [connState, setConnState] = useState('connecting'); // connecting | live | ended | error
  const [connError, setConnError] = useState('');
  const bottomRef = useRef(null);
  const seenIds = useRef(new Set());

  useEffect(() => {
    setLines([]);
    seenIds.current = new Set();
    setConnState('connecting');
    setConnError('');

    const url = getDeploymentLogStreamUrl(deploymentId);
    const es = new EventSource(url);

    es.addEventListener('open', () => setConnState('live'));

    es.addEventListener('log', (e) => {
      try {
        const log = JSON.parse(e.data);
        const key = log.id || `${log.source}:${log.timestamp}:${log.message}`;
        if (seenIds.current.has(key)) return;
        seenIds.current.add(key);
        setLines((prev) => [...prev, log]);
      } catch { /* ignore */ }
    });

    es.addEventListener('status', (e) => {
      try { setStreamStatus(JSON.parse(e.data)); } catch { /* ignore */ }
    });

    es.addEventListener('done', () => { setConnState('ended'); es.close(); });

    es.addEventListener('error', () => {
      setConnState((prev) => prev === 'ended' ? 'ended' : 'error');
      setConnError('Stream disconnected — showing logs received so far.');
      es.close();
    });

    return () => es.close();
  }, [deploymentId]);

  // Auto-scroll to newest line (full panel only)
  useEffect(() => {
    if (!compact) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length, compact]);

  const maxH = compact ? 200 : 520;

  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: compact ? 14 : 18 }}>
          {compact ? 'Live logs' : 'Build Logs'}
        </h2>
        <div className="row" style={{ gap: 8 }}>
          {connState === 'connecting' && <Badge tone="muted" dot>Connecting…</Badge>}
          {connState === 'live' && <Badge tone="success" dot>Live</Badge>}
          {connState === 'ended' && <Badge tone="info" dot={false}>Stream ended</Badge>}
          {connState === 'error' && <Badge tone="danger" dot={false}>Disconnected</Badge>}
        </div>
      </div>

      {streamStatus && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge tone={streamStatus.status === 'live' ? 'success' : streamStatus.status === 'failed' ? 'danger' : 'muted'} dot={false}>
            {streamStatus.currentStep || streamStatus.status || 'Preparing'}
          </Badge>
          {streamStatus.liveUrl && (
            <a href={streamStatus.liveUrl} target="_blank" rel="noopener noreferrer"
              className="badge info" style={{ textDecoration: 'none', fontSize: 11.5 }}>
              {streamStatus.liveUrl.replace(/^https?:\/\//, '')} ↗
            </a>
          )}
        </div>
      )}

      {streamStatus?.errorMessage && (
        <div style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10, padding: '7px 10px', background: 'var(--bg-deep)', borderRadius: 'var(--r-sm)', border: '1px solid var(--danger)' }}>
          <ICN.AlertCircle size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />
          {streamStatus.errorMessage}
        </div>
      )}

      <div className="term" style={{ maxHeight: maxH, overflowY: 'auto' }}>
        {lines.length === 0 && connState === 'connecting' && (
          <div><span className="dim">Connecting to log stream…</span></div>
        )}
        {lines.length === 0 && connState !== 'connecting' && (
          <div><span className="dim">No log lines yet. Render may still be queuing the build.</span></div>
        )}
        {lines.map((log, i) => (
          <div key={log.id || i} style={{ display: 'flex', gap: 8, lineHeight: 1.5 }}>
            <span className="ts" style={{ flexShrink: 0 }}>{formatTime(log.timestamp || log.createdAt)}</span>
            <span className="dim" style={{ flexShrink: 0 }}>[{log.source === 'render' ? 'render' : 'sys'}]</span>
            <span className={log.level === 'error' ? 'err' : log.level === 'warn' ? 'warn' : log.source === 'render' ? '' : 'dim'}>
              {log.message || log.msg}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {connError && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{connError}</p>}
    </div>
  );
}

function MetadataTable({ rows, empty }) {
  return (
    <div className="card card-flush"><div className="card-head"><h2>Configured disks</h2><span className="meta">{rows.length} items</span></div><table className="tbl"><thead><tr><th>Name</th><th>Mount</th><th>Size</th><th>Status</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={4}>{empty}</td></tr> : rows.map((row) => <tr key={row.diskId || row.name}><td className="mono">{row.name}</td><td className="mono">{row.mountPath}</td><td>{row.sizeGB} GB</td><td>{row.status}</td></tr>)}</tbody></table></div>
  );
}

function statusLabel(status) {
  return {
    configuration_required: 'Preparing',
    preparing: 'Preparing',
    queued: 'Queued',
    building: 'Building',
    deploying: 'Deploying',
    deployed: 'Verifying URL',
    deployed_unverified: 'Deployed - Warming Up',
    live: 'Live',
    failed: 'Failed',
    suspended: 'Suspended',
    deleted: 'Deleted',
  }[status] || status || 'Preparing';
}

function formatDate(value) {
  if (!value) return 'Not completed';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not completed' : date.toLocaleString();
}

function formatTime(value) {
  if (!value) return '--:--:--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '--:--:--' : date.toLocaleTimeString([], { hour12: false });
}

// ── Billing Tab ───────────────────────────────────────────────────────────────

const BSP_BANK_DETAILS = {
  bank: 'BSP (Bank of South Pacific)',
  accountName: 'Glondia Analysts & Consultancy',
  accountHolder: 'John Wesly Tawa',
  branch: 'Waigani',
  accountNumber: '0000242010',
  proofEmail: 'johnweslytawa@gmail.com',
};

function BillingTab({ deploymentId }) {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [payMethod, setPayMethod] = useState('paypal'); // 'paypal' | 'bsp'
  const [paypalError, setPaypalError] = useState('');
  const [showBspModal, setShowBspModal] = useState(false);

  const load = () => {
    setFetchError('');
    return getHostingPaymentStatus(deploymentId)
      .then((s) => setBilling(s))
      .catch((e) => setFetchError(e.message || 'Could not load billing status.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [deploymentId]);

  if (loading) return <div className="card" style={{ padding: 36 }}><Empty icon="CreditCard" title="Loading billing status…" /></div>;

  if (billing?.paid) {
    return (
      <div className="card">
        <div className="row" style={{ gap: 10, color: 'var(--accent)', marginBottom: 16 }}>
          <ICN.ShieldCheck size={18} />
          <h2 style={{ margin: 0 }}>Payment received</h2>
        </div>
        <div className="kv" style={{ gridTemplateColumns: '160px 1fr' }}>
          <dt>Status</dt><dd><Badge tone="success">Paid</Badge></dd>
          <dt>Paid at</dt><dd>{billing.paidAt ? new Date(billing.paidAt).toLocaleString() : 'On file'}</dd>
          <dt>Total charged</dt><dd>${billing.amounts?.totalAmount || '—'}</dd>
          <dt>Platform fee</dt><dd>${billing.amounts?.markupAmount || '—'}</dd>
          <dt>Hosting cost</dt><dd>${billing.amounts?.actualAmount || '—'}</dd>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>Your site will remain live. No further action required.</p>
      </div>
    );
  }

  const overdue = billing?.overdue;
  const hoursLeft = billing?.hoursRemaining ?? null;

  return (
    <>
      {showBspModal && <BspTransferModal onClose={() => setShowBspModal(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status banner */}
        <div className="card" style={{ borderColor: overdue ? 'var(--danger)' : 'var(--warning)', borderWidth: 1.5 }}>
          <div className="row" style={{ gap: 10, color: overdue ? 'var(--danger)' : 'var(--warning)', marginBottom: 12, fontWeight: 700, fontSize: 15 }}>
            <ICN.AlertCircle size={17} />
            {overdue
              ? 'Site suspended — payment overdue'
              : `Pay to keep your site live · ${hoursLeft > 0 ? `${hoursLeft}h remaining` : 'due now'}`}
          </div>
          <p className="muted" style={{ margin: '0 0 14px', fontSize: 13 }}>
            {overdue
              ? 'Your Render service was suspended because no payment was received within 24 hours of deployment. Complete payment below to restore it.'
              : `Your site will be automatically suspended if payment is not received within 24 hours of deployment. ${hoursLeft > 0 ? `You have ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left.` : 'Pay now to avoid interruption.'}`}
          </p>
          <div className="kv" style={{ gridTemplateColumns: '160px 1fr' }}>
            <dt>Deployed at</dt><dd>{billing?.deployedAt ? new Date(billing.deployedAt).toLocaleString() : '—'}</dd>
            <dt>Payment deadline</dt><dd>{billing?.deadlineAt ? new Date(billing.deadlineAt).toLocaleString() : '—'}</dd>
            <dt>Grace period</dt><dd>{billing?.graceHours || 24} hours</dd>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Choose payment method</h3>
          <div className="row" style={{ gap: 10, marginBottom: 20 }}>
            <BillingPayPill
              active={payMethod === 'paypal'}
              onClick={() => { setPayMethod('paypal'); setPaypalError(''); }}
              icon="CreditCard"
              label="PayPal"
              sub="Pay online instantly"
            />
            <BillingPayPill
              active={payMethod === 'bsp'}
              onClick={() => setPayMethod('bsp')}
              icon="Layers"
              label="BSP Bank Transfer"
              sub="Mobile / internet banking"
            />
          </div>

          {/* PayPal */}
          {payMethod === 'paypal' && (
            <>
              {paypalError && (
                <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'var(--bg-deep)', borderRadius: 'var(--r-sm)', border: '1px solid var(--danger)' }}>
                  <ICN.AlertCircle size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {paypalError}
                </div>
              )}
              <HostingPayPalButton
                deploymentId={deploymentId}
                onPaid={() => { setPaypalError(''); load(); }}
                onError={(msg) => setPaypalError(msg)}
              />
            </>
          )}

          {/* BSP Manual Transfer */}
          {payMethod === 'bsp' && (
            <div>
              <p className="muted" style={{ fontSize: 13, margin: '0 0 14px' }}>
                Transfer the hosting amount to our BSP account. Once sent, email us your proof of payment and we'll activate your site within 3 hours on the next business day.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '11px 0' }}
                onClick={() => setShowBspModal(true)}
              >
                <ICN.Layers size={15} /> View BSP Bank Account Details
              </button>
            </div>
          )}
        </div>

        {fetchError && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{fetchError}</div>}
      </div>
    </>
  );
}

function BillingPayPill({ active, onClick, icon, label, sub }) {
  const Icon = ICN[icon];
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        padding: '12px 14px',
        borderRadius: 'var(--r-sm)',
        border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: active ? 'var(--accent-soft)' : 'var(--bg-elev)',
        color: active ? 'var(--accent-ink)' : 'var(--text)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div className="row" style={{ gap: 7, fontWeight: 600, fontSize: 13.5 }}>
        <Icon size={15} /> {label}
      </div>
      <div style={{ fontSize: 11.5, color: active ? 'var(--accent-ink)' : 'var(--text-muted)', opacity: 0.85 }}>{sub}</div>
    </button>
  );
}

function BspTransferModal({ onClose }) {
  const [copied, setCopied] = useState('');

  const copy = (text, field) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const row = (label, value, copyKey) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 14, fontFamily: copyKey === 'account' ? 'var(--mono, monospace)' : 'inherit' }}>{value}</div>
      </div>
      {copyKey && (
        <button
          className="btn btn-sm btn-outline"
          onClick={() => copy(value, copyKey)}
          style={{ flexShrink: 0, marginLeft: 12 }}
        >
          {copied === copyKey ? <><ICN.Check size={12} /> Copied</> : <><ICN.Copy size={12} /> Copy</>}
        </button>
      )}
    </div>
  );

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--r)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-eyebrow" style={{ marginBottom: 4 }}>Manual Bank Transfer</div>
            <h2 style={{ margin: 0, fontSize: 20 }}>BSP Bank Details</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <ICN.X size={20} />
          </button>
        </div>

        {/* Account details */}
        <div style={{ padding: '16px 24px' }}>
          {row('Bank', BSP_BANK_DETAILS.bank)}
          {row('Account Name', BSP_BANK_DETAILS.accountName)}
          {row('Account Holder', BSP_BANK_DETAILS.accountHolder)}
          {row('Branch', BSP_BANK_DETAILS.branch)}
          {row('Account Number', BSP_BANK_DETAILS.accountNumber, 'account')}
        </div>

        {/* Instructions */}
        <div style={{ margin: '0 24px 20px', padding: '14px 16px', background: 'var(--bg-deep)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ICN.Mail size={14} /> After transferring, send proof of payment to:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 13, wordBreak: 'break-all' }}>
              {BSP_BANK_DETAILS.proofEmail}
            </span>
            <button className="btn btn-sm btn-outline" onClick={() => copy(BSP_BANK_DETAILS.proofEmail, 'email')} style={{ flexShrink: 0 }}>
              {copied === 'email' ? <><ICN.Check size={12} /> Copied</> : <><ICN.Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>

        {/* Processing notice */}
        <div style={{ margin: '0 24px 24px', padding: '12px 16px', background: 'var(--accent-soft)', borderRadius: 'var(--r-sm)', border: '1px solid var(--accent)', color: 'var(--accent-ink)' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Processing time</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            Payment will be processed in <strong>less than 3 hours</strong> after proof is received.<br />
            Business hours: <strong>8:00 AM – 4:00 PM, Monday to Friday</strong> (PNG time).<br />
            Transfers received outside business hours will be processed the next business day.
          </div>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
            Got it — I'll send the receipt
          </button>
        </div>
      </div>
    </div>
  );
}

function HostingPayPalButton({ deploymentId, onPaid, onError }) {
  const ref = useRef(null);
  const checkoutRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      try {
        const settings = await getPayPalClientSettings();
        if (!settings.configured || !settings.clientId) {
          onError?.('PayPal is not configured on this server. Contact support to arrange payment.');
          return;
        }
        await loadPayPalSdkForHosting(settings.clientId);
        if (cancelled || !ref.current || !window.paypal?.Buttons) return;
        ref.current.innerHTML = '';
        const buttons = window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay' },
          createOrder: async () => {
            const order = await createHostingPayPalOrder({ deploymentId });
            checkoutRef.current = order.checkoutOrderId;
            return order.providerOrderId;
          },
          onApprove: async (data) => {
            const result = await captureHostingPayPalOrder({
              checkoutOrderId: checkoutRef.current,
              providerOrderId: data.orderID,
            });
            onPaid?.(result);
          },
          onError: (err) => onError?.(err?.message || 'PayPal checkout failed.'),
          onCancel: () => onError?.('PayPal payment was cancelled.'),
        });
        buttonsRef.current = buttons;
        await buttons.render(ref.current);
      } catch (err) {
        if (!cancelled) onError?.(err.message || 'PayPal checkout is unavailable.');
      }
    };
    setup();
    return () => {
      cancelled = true;
      buttonsRef.current?.close?.();
      buttonsRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} />;
}

function loadPayPalSdkForHosting(clientId) {
  if (window.paypal?.Buttons) return Promise.resolve();
  const existing = document.querySelector('script[data-glondia-paypal]');
  if (existing) return new Promise((resolve, reject) => {
    existing.addEventListener('load', resolve, { once: true });
    existing.addEventListener('error', reject, { once: true });
  });
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.dataset.glondiaPaypal = 'true';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load PayPal checkout.'));
    document.head.appendChild(script);
  });
}

// ─── Hosting Settings & integrations ─────────────────────────────────────────

function HostingSettings() {
  const [renderCfg, setRenderCfg]   = useState(null);
  const [githubCfg, setGithubCfg]   = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([getRenderSettings(), getGitHubStatus()])
      .then(([r, g]) => {
        if (!alive) return;
        setRenderCfg(r);
        setGithubCfg(g);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) return (
    <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
      Loading settings…
    </div>
  );

  const demo      = isLiveMode() === false;
  const renderOk  = renderCfg?.configured  ?? false;
  const githubOk  = githubCfg?.connected   ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {demo && (
        <div className="card" style={{
          padding: '14px 18px', fontSize: 13,
          borderLeft: '3px solid var(--accent)', background: 'var(--accent-soft)',
        }}>
          <span style={{ fontWeight: 600 }}>Demo mode active</span>
          {' '}— real deployments are disabled. Set <code className="mono">VITE_APP_MODE=live</code> on your frontend to enable live Render API calls.
        </div>
      )}

      {/* ── Integration status cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: renderOk ? 'var(--accent-soft)' : 'rgba(239,68,68,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: renderOk ? 'var(--accent)' : 'var(--danger)',
            }}>
              <ICN.Server size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>Render API</span>
                <StatusBadge value={renderOk ? 'connected' : 'error'} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                {renderOk
                  ? 'Connected. Deployments can be triggered and monitored via Render.'
                  : 'Not configured. Add RENDER_API_KEY and RENDER_OWNER_ID to enable deployments.'}
              </div>
              <div className="mono" style={{ fontSize: 11, background: 'var(--bg-deep)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-faint)' }}>
                RENDER_API_KEY · RENDER_OWNER_ID
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: githubOk ? 'var(--accent-soft)' : 'rgba(239,68,68,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: githubOk ? 'var(--accent)' : 'var(--danger)',
            }}>
              <ICN.Git size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>GitHub</span>
                <StatusBadge value={githubOk ? 'connected' : demo ? 'warn' : 'error'} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                {githubOk
                  ? `Connected as @${githubCfg?.login || 'user'}. Repos are accessible for import and auto-deploy.`
                  : 'Connect your GitHub account to deploy from repositories and enable push-to-deploy.'}
              </div>
              <div className="mono" style={{ fontSize: 11, background: 'var(--bg-deep)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-faint)' }}>
                GITHUB_CLIENT_ID · GITHUB_CLIENT_SECRET
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <ICN.CreditCard size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>Billing (PayPal)</span>
                <StatusBadge value="info" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                Customers pay per deployment via PayPal or BSP bank transfer.
                Payment records are stored in the Glondia database per deployment.
              </div>
              <div className="mono" style={{ fontSize: 11, background: 'var(--bg-deep)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-faint)' }}>
                PAYPAL_CLIENT_ID · PAYPAL_CLIENT_SECRET
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How deployment works ── */}
      <div className="card">
        <div className="card-head"><h2>How Render hosting works</h2></div>
        <div style={{ padding: '0 16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
          {[
            { n: '1', title: 'Connect GitHub',        body: 'Link your GitHub account — all repos are listed for import and auto-deploy on push.' },
            { n: '2', title: 'Choose a source',       body: 'Deploy from a GitHub repo, upload a ZIP, or build a site with the AI Site Builder.' },
            { n: '3', title: 'Glondia → Render',      body: 'Our backend sends the build config to the Render API and tracks the deployment.' },
            { n: '4', title: 'Live URL returned',     body: 'Render builds, deploys, and returns a live HTTPS URL — visible from your dashboard.' },
            { n: '5', title: 'Manage & redeploy',     body: 'Edit env vars, attach persistent disk, add custom domains, and tail build logs — all from here.' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ padding: 14, background: 'var(--bg-deep)', borderRadius: 'var(--r)' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, marginBottom: 10,
              }}>{n}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Required env vars ── */}
      <div className="card card-flush">
        <div className="card-head">
          <h2>Environment variables</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Set on your Render backend service</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'RENDER_API_KEY',        purpose: 'Authenticate with Render API for deploy + status',      ok: renderOk },
              { key: 'RENDER_OWNER_ID',       purpose: 'Target Render account / team for new services',         ok: renderOk },
              { key: 'GITHUB_CLIENT_ID',      purpose: 'GitHub OAuth App — enables repo listing & connect',     ok: githubOk },
              { key: 'GITHUB_CLIENT_SECRET',  purpose: 'GitHub OAuth App secret',                              ok: githubOk },
              { key: 'PAYPAL_CLIENT_ID',      purpose: 'PayPal REST API — enables payment checkout',            ok: false },
              { key: 'PAYPAL_CLIENT_SECRET',  purpose: 'PayPal REST API secret',                               ok: false },
              { key: 'VITE_APP_MODE=live',    purpose: 'Frontend env var — switches from demo to live API',     ok: !demo },
            ].map(({ key, purpose, ok }) => (
              <tr key={key}>
                <td className="mono" style={{ fontSize: 12 }}>{key}</td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{purpose}</td>
                <td><StatusBadge value={ok ? 'connected' : 'error'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
