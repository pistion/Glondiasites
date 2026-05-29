import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ICN } from './icons';
import { Badge, Empty, StatusBadge, Tabs } from './components';
import {
  getDeploymentLogStreamUrl,
  getHostingPaymentStatus,
  getHostingService,
  getRenderDeploymentStatus,
  getRenderSettings,
  listHostingDeployments,
  redeployRenderDeployment,
  syncHostingDeployment,
  suspendHostingDeployment,
  deleteHostingDeployment,
  verifyRenderDeploymentUrl,
  listHostingEnvVars,
  upsertHostingEnvVar,
  deleteHostingEnvVar,
  syncHostingEnvVars,
  listHostingDisks,
  attachHostingDisk,
  updateHostingDisk,
  deleteHostingDisk,
  listHostingDomains,
  addHostingDomain,
  deleteHostingDomain,
  verifyHostingDomain,
  updateHostingSettings,
} from './api';

// ── Source-type helpers ─────────────────────────────────────────────────────

function getHostingSourceType(app) {
  if (app?.source === 'zip-upload' || app?.generatedSite?.sourceType === 'uploaded-zip-source-artifact') return 'zip-upload';
  if (app?.source === 'ai-tailored-template' || app?.sourceReference === 'roxanne-ai-tailored-template') return 'roxanne-ai';
  if (app?.githubRepo || app?.source === 'github') return 'github';
  return 'builder';
}

function isZipUpload(app) { return getHostingSourceType(app) === 'zip-upload'; }
function isRoxanneGenerated(app) { return getHostingSourceType(app) === 'roxanne-ai'; }

function sourceLabel(app) {
  const t = getHostingSourceType(app);
  if (t === 'zip-upload') return 'ZIP Upload';
  if (t === 'roxanne-ai') return 'RoxanneAI generated';
  if (t === 'github') return 'GitHub import';
  return 'Builder';
}

function sourceBadgeTone(app) {
  const t = getHostingSourceType(app);
  if (t === 'zip-upload') return 'info';
  if (t === 'roxanne-ai') return 'info';
  if (t === 'github') return 'muted';
  return 'muted';
}

/** The root Render should pull from — NOT the local siteDir. */
function getRenderSourceRoot(app) {
  return (
    app?.generatedSite?.sourceArtifact?.targetRoot ||
    app?.generatedSite?.githubTargetRoot ||
    app?.render?.githubPublish?.targetRoot ||
    app?.environmentConfiguration?.rootDirectory ||
    ''
  );
}

function hasRealRenderId(id) { return id && !String(id).includes('_pending'); }

// ── Hosting List ────────────────────────────────────────────────────────────

export function HostingList({ navigate }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('apps');

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
          <p className="sub">Deploy and manage apps created from GitHub, ZIP imports, or RoxanneAI Site Builder templates.</p>
        </div>
        <div className="actions">
          {tab === 'apps' && (
            <>
              <button className="btn btn-outline" onClick={() => navigate({ view: 'builder-templates' })}><ICN.Layers size={14} /> Site builder</button>
              <button className="btn btn-primary" onClick={() => navigate({ view: 'builder-import', params: { mode: 'github' } })}><ICN.Git size={14} /> Deploy from GitHub</button>
            </>
          )}
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} options={[{ value: 'apps', label: 'My apps' }, { value: 'settings', label: 'Settings' }]} />

      {tab === 'apps' ? (
        <>
          {error && <div className="card" style={{ padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
          {loading ? (
            <div className="card" style={{ padding: '42px 24px' }}><Empty icon="Server" title="Loading hosting apps..." /></div>
          ) : apps.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px' }}>
              <Empty
                icon="Server"
                title="No hosted apps yet"
                body="Build with the Site Builder or deploy from GitHub to create your first hosting app."
                action={<button className="btn btn-primary" onClick={() => navigate({ view: 'builder-templates' })}><ICN.Layers size={14} /> Site builder</button>}
              />
            </div>
          ) : (
            <div className="grid-2">{apps.map((app) => <HostingAppCard key={app.deploymentId || app.id} app={app} navigate={navigate} />)}</div>
          )}
        </>
      ) : <HostingSettings />}
    </>
  );
}

// ── Hosting App Card ────────────────────────────────────────────────────────

function HostingAppCard({ app, navigate }) {
  const src = sourceLabel(app);
  const building = ['preparing', 'queued', 'building', 'deploying', 'verifying'].includes(app.status);
  return (
    <button
      type="button"
      className="card"
      onClick={() => navigate({ view: 'hosting-detail', params: { id: app.deploymentId || app.id } })}
      style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14, color: 'inherit' }}
    >
      <div className="row between">
        <div className="row" style={{ gap: 12, minWidth: 0 }}>
          <span className="proj-thumb" style={{ width: 40, height: 40, fontSize: 15 }}>{(app.serviceName || app.siteName || 'A')[0]}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{app.serviceName || app.siteName}</div>
            <div className="mono faint" style={{ fontSize: 12 }}>{src}</div>
          </div>
        </div>
        <StatusBadge value={statusLabel(app.status)} />
      </div>
      <Badge tone={sourceBadgeTone(app)} dot={false}>{src}</Badge>
      {building && <DeploymentPulse compact />}
      <div className="kv" style={{ gridTemplateColumns: '110px 1fr', gap: '6px 14px' }}>
        <dt>Step</dt><dd>{app.currentStep || statusLabel(app.status)}</dd>
        <dt>Build</dt><dd className="mono">{app.buildStatus || 'pending'}</dd>
        <dt>Live URL</dt><dd className="mono">{app.liveUrl ? app.liveUrl.replace(/^https?:\/\//, '') : 'Pending'}</dd>
        <dt>Source</dt><dd className="mono">{src}</dd>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {app.liveUrl && <a className="btn btn-sm btn-outline" href={app.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><ICN.ExternalLink size={13} /> View Live Site</a>}
        <span className="btn btn-sm btn-primary">Manage</span>
      </div>
    </button>
  );
}

// ── Hosting Detail ──────────────────────────────────────────────────────────

export function HostingDetail({ id, navigate }) {
  const deploymentId = id;
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');

  const load = useCallback(async () => {
    const [hosting, nextStatus] = await Promise.all([
      getHostingService(deploymentId),
      getRenderDeploymentStatus(deploymentId).catch(() => null),
    ]);
    setApp(hosting);
    setStatus(nextStatus);
  }, [deploymentId]);

  useEffect(() => {
    let cancelled = false;
    const run = () => load().catch((err) => { if (!cancelled) setError(err.message || 'Hosting app could not be loaded.'); }).finally(() => { if (!cancelled) setLoading(false); });
    run();
    const interval = setInterval(run, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [deploymentId, load]);

  const merged = useMemo(() => ({ ...(app || {}), ...(status || {}) }), [app, status]);
  const isDeleted = merged.status === 'deleted';

  const runAction = async (name, fn) => {
    setBusy(name);
    setError('');
    try { await fn(); await load(); } catch (err) { setError(err.message || 'Action failed.'); } finally { setBusy(''); }
  };

  if (loading) return <div className="card" style={{ padding: 42 }}><Empty icon="Server" title="Loading hosting app..." /></div>;
  if (!app) return <div className="card" style={{ padding: 42 }}><Empty icon="AlertCircle" title="Hosting app not found" action={<button className="btn btn-outline" onClick={() => navigate({ view: 'hosting-list' })}>Back to Hosting</button>} /></div>;

  const src = sourceLabel(merged);

  return (
    <>
      <div className="page-head">
        <div>
          <button className="page-eyebrow" style={{ background: 'none', border: 0, padding: 0, color: 'var(--text-muted)' }} onClick={() => navigate({ view: 'hosting-list' })}>Back to Hosting</button>
          <div className="row" style={{ gap: 14, marginTop: 8 }}>
            <span className="proj-thumb" style={{ width: 44, height: 44, fontSize: 16 }}>{(merged.serviceName || 'A')[0]}</span>
            <div>
              <h1 style={{ margin: 0 }}>{merged.serviceName || merged.siteName}</h1>
              <div className="row" style={{ gap: 10, marginTop: 6, color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}>
                <span className="mono">{hasRealRenderId(merged.renderServiceId) ? merged.renderServiceId : merged.deploymentId}</span>
                <span>·</span>
                <StatusBadge value={statusLabel(merged.status)} />
                <Badge tone={sourceBadgeTone(merged)} dot={false}>{src}</Badge>
                {merged.lastRenderSyncedAt && <span className="mono">Synced {formatDate(merged.lastRenderSyncedAt)}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          {merged.liveUrl && <a className="btn btn-outline" href={merged.liveUrl} target="_blank" rel="noopener noreferrer"><ICN.ExternalLink size={14} /> View Live Site</a>}
          {merged.liveUrl && <button className="btn btn-outline" onClick={() => navigator.clipboard?.writeText(merged.liveUrl)}><ICN.Copy size={14} /> Copy URL</button>}
          <button className="btn btn-outline" disabled={!!busy || isDeleted || !hasRealRenderId(merged.renderServiceId)} onClick={() => runAction('sync', () => syncHostingDeployment(deploymentId))}><ICN.Refresh size={14} /> Sync with Render</button>
          <button className="btn btn-primary" disabled={!!busy || isDeleted} onClick={() => runAction('redeploy', () => redeployRenderDeployment(deploymentId))}><ICN.Refresh size={14} /> Redeploy</button>
        </div>
      </div>

      {error && <div className="card" style={{ padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

      <div className="grid-side">
        <DeploymentStatusPanel app={merged} onVerify={() => runAction('verify', () => verifyRenderDeploymentUrl(deploymentId))} busy={busy} />
        <AdminPanel
          app={merged}
          busy={busy}
          onSuspend={() => window.confirm('Suspend this site?') && runAction('suspend', () => suspendHostingDeployment(deploymentId))}
          onDelete={() => window.confirm('Delete this hosted site? This cannot be undone.') && runAction('delete', async () => { await deleteHostingDeployment(deploymentId); navigate({ view: 'hosting-list' }); })}
        />
      </div>

      <Tabs value={tab} onChange={setTab} options={['Overview', 'Billing', 'Build Logs', 'Render Settings', 'Env Vars', 'Domains']} />

      {tab === 'Overview' && <OverviewTab app={merged} deploymentId={deploymentId} />}
      {tab === 'Billing' && <BillingTab deploymentId={deploymentId} />}
      {tab === 'Build Logs' && <LiveLogsPanel deploymentId={deploymentId} />}
      {tab === 'Render Settings' && <RenderSettingsTab app={merged} deploymentId={deploymentId} onReload={load} />}
      {tab === 'Env Vars' && <EnvVarsTab deploymentId={deploymentId} />}
      {tab === 'Domains' && <DomainsTab app={merged} deploymentId={deploymentId} />}
    </>
  );
}
