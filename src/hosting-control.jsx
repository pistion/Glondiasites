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
  verifyRenderDeploymentUrl,
  listHostingEnvVars,
  upsertHostingEnvVar,
  syncHostingEnvVars,
  listHostingDisks,
  attachHostingDisk,
  updateHostingDisk,
  listHostingDomains,
  addHostingDomain,
  verifyHostingDomain,
  updateHostingSettings,
  updateHostingDeploySettings,
  updateHostingBuildSettings,
  updateHostingSourceSettings,
  redeployHostingWithSettings,
} from './api';

function getHostingSourceType(app) {
  if (app?.source === 'zip-upload' || app?.generatedSite?.sourceType === 'uploaded-zip-source-artifact') return 'zip-upload';
  if (app?.source === 'ai-tailored-template' || app?.sourceReference === 'roxanne-ai-tailored-template') return 'roxanne-ai';
  if (app?.githubRepo || app?.source === 'github') return 'github';
  return 'builder';
}
function isZipUpload(app) { return getHostingSourceType(app) === 'zip-upload'; }
function isRoxanneGenerated(app) { return getHostingSourceType(app) === 'roxanne-ai'; }
function sourceLabel(app) { const t = getHostingSourceType(app); return t === 'zip-upload' ? 'ZIP Upload' : t === 'roxanne-ai' ? 'RoxanneAI generated' : t === 'github' ? 'GitHub import' : 'Builder'; }
function sourceBadgeTone(app) { const t = getHostingSourceType(app); return t === 'zip-upload' || t === 'roxanne-ai' ? 'info' : 'muted'; }
function getRenderSourceRoot(app) { return app?.generatedSite?.sourceArtifact?.targetRoot || app?.generatedSite?.githubTargetRoot || app?.render?.githubPublish?.targetRoot || app?.environmentConfiguration?.rootDirectory || ''; }
function hasRealRenderId(id) { return Boolean(id && !String(id).includes('_pending')); }

export function HostingList({ navigate }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('apps');
  useEffect(() => {
    let cancelled = false;
    listHostingDeployments().then((items) => { if (!cancelled) setApps(items || []); }).catch((err) => { if (!cancelled) setError(err.message || 'Hosting apps could not be loaded.'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  return <><div className="page-head"><div><div className="page-eyebrow">Hosting</div><h1>Render Hosting</h1><p className="sub">Deploy and manage apps created from GitHub, ZIP imports, or RoxanneAI Site Builder templates.</p></div><div className="actions">{tab === 'apps' && <><button className="btn btn-outline" onClick={() => navigate({ view: 'builder-templates' })}><ICN.Layers size={14} /> Site builder</button><button className="btn btn-primary" onClick={() => navigate({ view: 'builder-import', params: { mode: 'github' } })}><ICN.Git size={14} /> Deploy from GitHub</button></>}</div></div><Tabs value={tab} onChange={setTab} options={[{ value: 'apps', label: 'My apps' }, { value: 'settings', label: 'Settings' }]} />{tab === 'apps' ? <>{error && <div className="card" style={{ padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}{loading ? <div className="card" style={{ padding: '42px 24px' }}><Empty icon="Server" title="Loading hosting apps..." /></div> : apps.length === 0 ? <div className="card" style={{ padding: '48px 24px' }}><Empty icon="Server" title="No hosted apps yet" body="Build with the Site Builder or deploy from GitHub to create your first hosting app." action={<button className="btn btn-primary" onClick={() => navigate({ view: 'builder-templates' })}><ICN.Layers size={14} /> Site builder</button>} /></div> : <div className="grid-2">{apps.map((app) => <HostingAppCard key={app.deploymentId || app.id} app={app} navigate={navigate} />)}</div>}</> : <HostingSettings />}</>;
}

function HostingAppCard({ app, navigate }) {
  const src = sourceLabel(app); const building = ['preparing', 'queued', 'building', 'deploying', 'verifying'].includes(app.status);
  return <button type="button" className="card" onClick={() => navigate({ view: 'hosting-detail', params: { id: app.deploymentId || app.id } })} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14, color: 'inherit' }}><div className="row between"><div className="row" style={{ gap: 12, minWidth: 0 }}><span className="proj-thumb" style={{ width: 40, height: 40, fontSize: 15 }}>{(app.serviceName || app.siteName || 'A')[0]}</span><div style={{ minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{app.serviceName || app.siteName}</div><div className="mono faint" style={{ fontSize: 12 }}>{src}</div></div></div><StatusBadge value={statusLabel(app.status)} /></div><Badge tone={sourceBadgeTone(app)} dot={false}>{src}</Badge>{building && <DeploymentPulse compact />}<div className="kv" style={{ gridTemplateColumns: '110px 1fr', gap: '6px 14px' }}><dt>Step</dt><dd>{app.currentStep || statusLabel(app.status)}</dd><dt>Build</dt><dd className="mono">{app.buildStatus || 'pending'}</dd><dt>Live URL</dt><dd className="mono">{app.liveUrl ? app.liveUrl.replace(/^https?:\/\//, '') : 'Pending'}</dd><dt>Source</dt><dd className="mono">{src}</dd></div><div className="row" style={{ gap: 8 }}>{app.liveUrl && <a className="btn btn-sm btn-outline" href={app.liveUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><ICN.ExternalLink size={13} /> View Live Site</a>}<span className="btn btn-sm btn-primary">Manage</span></div></button>;
}

export function HostingDetail({ id, navigate }) {
  const deploymentId = id; const [app, setApp] = useState(null); const [status, setStatus] = useState(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(''); const [error, setError] = useState(''); const [tab, setTab] = useState('Overview');
  const load = useCallback(async () => { const [hosting, nextStatus] = await Promise.all([getHostingService(deploymentId), getRenderDeploymentStatus(deploymentId).catch(() => null)]); setApp(hosting); setStatus(nextStatus); }, [deploymentId]);
  useEffect(() => { let cancelled = false; const run = () => load().catch((err) => { if (!cancelled) setError(err.message || 'Hosting app could not be loaded.'); }).finally(() => { if (!cancelled) setLoading(false); }); run(); const interval = setInterval(run, 5000); return () => { cancelled = true; clearInterval(interval); }; }, [deploymentId, load]);
  const merged = useMemo(() => ({ ...(app || {}), ...(status || {}) }), [app, status]); const isRemoved = merged.status === 'deleted';
  const runAction = async (name, fn) => { setBusy(name); setError(''); try { await fn(); await load(); } catch (err) { setError(err.message || 'Action failed.'); } finally { setBusy(''); } };
  if (loading) return <div className="card" style={{ padding: 42 }}><Empty icon="Server" title="Loading hosting app..." /></div>;
  if (!app) return <div className="card" style={{ padding: 42 }}><Empty icon="AlertCircle" title="Hosting app not found" action={<button className="btn btn-outline" onClick={() => navigate({ view: 'hosting-list' })}>Back to Hosting</button>} /></div>;
  const src = sourceLabel(merged);
  return <><div className="page-head"><div><button className="page-eyebrow" style={{ background: 'none', border: 0, padding: 0, color: 'var(--text-muted)' }} onClick={() => navigate({ view: 'hosting-list' })}>Back to Hosting</button><div className="row" style={{ gap: 14, marginTop: 8 }}><span className="proj-thumb" style={{ width: 44, height: 44, fontSize: 16 }}>{(merged.serviceName || 'A')[0]}</span><div><h1 style={{ margin: 0 }}>{merged.serviceName || merged.siteName}</h1><div className="row" style={{ gap: 10, marginTop: 6, color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}><span className="mono">{hasRealRenderId(merged.renderServiceId) ? merged.renderServiceId : merged.deploymentId}</span><span>·</span><StatusBadge value={statusLabel(merged.status)} /><Badge tone={sourceBadgeTone(merged)} dot={false}>{src}</Badge>{merged.lastRenderSyncedAt && <span className="mono">Synced {formatDate(merged.lastRenderSyncedAt)}</span>}</div></div></div></div><div className="actions">{merged.liveUrl && <a className="btn btn-outline" href={merged.liveUrl} target="_blank" rel="noopener noreferrer"><ICN.ExternalLink size={14} /> View Live Site</a>}{merged.liveUrl && <button className="btn btn-outline" onClick={() => navigator.clipboard?.writeText(merged.liveUrl)}><ICN.Copy size={14} /> Copy URL</button>}<button className="btn btn-outline" disabled={!!busy || isRemoved || !hasRealRenderId(merged.renderServiceId)} onClick={() => runAction('sync', () => syncHostingDeployment(deploymentId))}><ICN.Refresh size={14} /> Sync with Render</button><button className="btn btn-primary" disabled={!!busy || isRemoved} onClick={() => runAction('redeploy', () => redeployRenderDeployment(deploymentId))}><ICN.Refresh size={14} /> Redeploy</button></div></div>{error && <div className="card" style={{ padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}<div className="grid-side"><DeploymentStatusPanel app={merged} onVerify={() => runAction('verify', () => verifyRenderDeploymentUrl(deploymentId))} busy={busy} /><AdminPanel app={merged} busy={busy} onSuspend={() => window.confirm('Suspend this site?') && runAction('suspend', () => suspendHostingDeployment(deploymentId))} /></div><Tabs value={tab} onChange={setTab} options={['Overview', 'Billing', 'Build Logs', 'Render Settings', 'Env Vars', 'Disks', 'Domains']} />{tab === 'Overview' && <OverviewTab app={merged} deploymentId={deploymentId} />}{tab === 'Billing' && <BillingTab deploymentId={deploymentId} />}{tab === 'Build Logs' && <LiveLogsPanel deploymentId={deploymentId} />}{tab === 'Render Settings' && <RenderSettingsTab app={merged} deploymentId={deploymentId} onReload={load} />}{tab === 'Env Vars' && <EnvVarsTab deploymentId={deploymentId} />}{tab === 'Disks' && <DisksTab app={merged} deploymentId={deploymentId} />}{tab === 'Domains' && <DomainsTab app={merged} deploymentId={deploymentId} />}</>;
}

function DeploymentStatusPanel({ app, onVerify, busy }) { const hasService = hasRealRenderId(app.renderServiceId); const hasDeploy = hasRealRenderId(app.renderDeployId); const renderAttempted = Boolean(app.render?.attempted || hasService || hasDeploy); const renderPending = !renderAttempted && (String(app.renderServiceId || '').includes('_pending') || app.render?.skippedReason); const shouldAnimate = ['preparing', 'queued', 'building', 'deploying', 'verifying'].includes(app.status) && !renderPending; return <div className="card"><div className="row between"><div><div className="page-eyebrow" style={{ marginBottom: 6 }}>{sourceLabel(app)} deployment status</div><h2 style={{ margin: 0 }}>{statusLabel(app.status)}</h2></div><StatusBadge value={statusLabel(app.status)} /></div>{(isZipUpload(app) || isRoxanneGenerated(app)) && <SourcePackageBlock app={app} />}{renderAttempted && <RenderStartedBlock app={app} />}{!renderAttempted && renderPending && <RenderNotStartedBlock app={app} />}{shouldAnimate && <DeploymentPulse />}{app.status === 'failed' && <FailureBlock app={app} />}{app.status === 'live' && <SuccessBlock app={app} />}{app.status === 'deployed_unverified' && <WarmingBlock app={app} />}<div className="kv" style={{ marginTop: 16, gridTemplateColumns: '150px 1fr' }}><dt>Current step</dt><dd>{app.currentStep || statusLabel(app.status)}</dd><dt>Build status</dt><dd className="mono">{app.buildStatus || 'pending'}</dd><dt>Render handoff</dt><dd>{renderAttempted ? 'Started' : renderPending ? 'Waiting for configuration' : 'Ready'}</dd><dt>URL verification</dt><dd>{app.urlReachable ? 'Reachable' : app.liveUrl ? 'Warming up' : 'Pending URL'}</dd></div>{app.liveUrl && !app.urlReachable && <button className="btn btn-sm btn-outline" style={{ marginTop: 14 }} onClick={onVerify} disabled={busy === 'verify'}><ICN.Refresh size={13} /> Retry URL verification</button>}</div>; }
function SourcePackageBlock({ app }) { const g = app.generatedSite || {}; const root = getRenderSourceRoot(app); const repo = app.environmentConfiguration?.sourceRepository || g.sourceRepository || ''; return <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', background: 'var(--accent-soft)' }}><div className="row" style={{ gap: 8, color: 'var(--accent)', fontWeight: 700 }}><ICN.CheckCircle size={16} /> {isZipUpload(app) ? 'ZIP source package prepared' : 'Generated Vite React site prepared'}</div><div className="kv" style={{ marginTop: 10, gridTemplateColumns: '155px 1fr', fontSize: 12.5 }}>{g.uploadedFileName && <><dt>Uploaded file</dt><dd className="mono">{g.uploadedFileName}</dd></>}<dt>Deployable files</dt><dd>{Array.isArray(g.files) ? g.files.length : 0}</dd>{Array.isArray(g.ignoredFiles) && <><dt>Ignored files</dt><dd>{g.ignoredFiles.length}</dd></>}<dt>Framework</dt><dd className="mono">{g.framework || g.projectType || 'vite-react'}</dd>{repo && <><dt>Source repository</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{repo}</dd></>}{root && <><dt>Render root directory</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{root}</dd></>}{g.siteDir && <><dt>Internal storage path</dt><dd className="mono" style={{ wordBreak: 'break-all', opacity: 0.7 }}>{g.siteDir}</dd></>}</div></div>; }
function RenderStartedBlock({ app }) { return <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}><div className="row" style={{ gap: 8, color: 'var(--accent)', fontWeight: 700 }}><ICN.CheckCircle size={16} /> Render deployment started</div><div className="kv" style={{ marginTop: 10, gridTemplateColumns: '130px 1fr', fontSize: 12.5 }}><dt>Service ID</dt><dd className="mono">{hasRealRenderId(app.renderServiceId) ? app.renderServiceId : 'Pending'}</dd><dt>Deploy ID</dt><dd className="mono">{hasRealRenderId(app.renderDeployId) ? app.renderDeployId : 'Pending'}</dd><dt>Current step</dt><dd>{app.currentStep || statusLabel(app.status)}</dd>{app.liveUrl && <><dt>Live URL</dt><dd className="mono" style={{ wordBreak: 'break-all' }}><a href={app.liveUrl} target="_blank" rel="noopener noreferrer">{app.liveUrl}</a></dd></>}</div></div>; }
function RenderNotStartedBlock({ app }) { const reason = app.render?.skippedReason || app.errorMessage || 'Render has not received a deployable source repository/API configuration yet.'; return <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--warning)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}><div className="row" style={{ gap: 8, color: 'var(--warning)', fontWeight: 700 }}><ICN.AlertCircle size={16} /> Render handoff pending</div><div className="muted" style={{ marginTop: 8 }}>{reason}</div><div className="mono" style={{ marginTop: 8, fontSize: 12 }}>Required: RENDER_API_KEY and RENDER_OWNER_ID. For generated sites, also set RENDER_GENERATED_SITES_REPO_URL.</div></div>; }
function DeploymentPulse({ compact = false }) { return <div style={{ marginTop: compact ? 0 : 18, display: 'grid', gap: 8 }}><div style={{ height: compact ? 6 : 8, borderRadius: 999, background: 'var(--bg-deep)', overflow: 'hidden' }}><div style={{ height: '100%', width: '42%', background: 'var(--accent)', borderRadius: 999, animation: 'pulse 1.2s ease-in-out infinite' }} /></div>{!compact && <div className="muted" style={{ fontSize: 13 }}>Preparing, sending to Render, building, deploying, then verifying the live URL.</div>}</div>; }
function SuccessBlock({ app }) { return <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}><div className="row" style={{ gap: 8, color: 'var(--accent)', fontWeight: 700 }}><ICN.CheckCircle size={16} /> Deployment is live</div><div className="mono" style={{ marginTop: 8, wordBreak: 'break-all' }}>{app.liveUrl}</div></div>; }
function WarmingBlock({ app }) { return <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--warning)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}><div className="row" style={{ gap: 8, color: 'var(--warning)', fontWeight: 700 }}><ICN.Refresh size={16} /> Deployed, still warming up</div><div className="mono" style={{ marginTop: 8, wordBreak: 'break-all' }}>{app.liveUrl || 'URL pending from Render'}</div></div>; }
function FailureBlock({ app }) { return <div style={{ marginTop: 18, padding: 14, border: '1px solid var(--danger)', borderRadius: 'var(--r-sm)', background: 'var(--bg-deep)' }}><div className="row" style={{ gap: 8, color: 'var(--danger)', fontWeight: 700 }}><ICN.AlertCircle size={16} /> Deployment failed</div><div className="muted" style={{ marginTop: 8 }}>{app.errorMessage || 'Review logs and settings, then redeploy.'}</div></div>; }
function AdminPanel({ app, busy, onSuspend }) { const real = hasRealRenderId(app.renderServiceId); return <div className="card"><h2 style={{ marginTop: 0 }}>Admin controls</h2><div className="kv" style={{ gridTemplateColumns: '140px 1fr', marginBottom: 16 }}><dt>Deployment ID</dt><dd className="mono">{app.deploymentId}</dd><dt>Render service</dt><dd className="mono">{real ? app.renderServiceId : 'Pending configuration'}</dd><dt>Render deploy</dt><dd className="mono">{hasRealRenderId(app.renderDeployId) ? app.renderDeployId : 'Pending'}</dd><dt>Last synced</dt><dd>{formatDate(app.lastRenderSyncedAt)}</dd><dt>Created</dt><dd>{formatDate(app.createdAt)}</dd></div><div style={{ display: 'grid', gap: 10 }}><button className="btn btn-outline" disabled={!real || busy === 'suspend' || app.status === 'suspended'} onClick={onSuspend}><ICN.Power size={14} /> Suspend Site</button></div></div>; }
function OverviewTab({ app, deploymentId }) { const g = app.generatedSite || {}; const s = app.environmentConfiguration || {}; const root = getRenderSourceRoot(app); return <div className="grid-side"><div style={{ display: 'grid', gap: 16 }}><div className="card"><h2 style={{ marginTop: 0 }}>Hosting app</h2><div className="kv"><dt>Source</dt><dd className="mono">{sourceLabel(app)}</dd><dt>Branch</dt><dd className="mono">{app.githubBranch || s.branch || 'main'}</dd><dt>Service type</dt><dd><Badge tone="info" dot={false}>{app.serviceType}</Badge></dd><dt>Live URL</dt><dd className="mono">{app.liveUrl || 'Pending'}</dd>{s.sourceRepository && <><dt>Source repository</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{s.sourceRepository}</dd></>}{root && <><dt>Render root</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{root}</dd></>}<dt>Build command</dt><dd className="mono">{s.buildCommand || g.buildCommand || 'Not set'}</dd><dt>Publish directory</dt><dd className="mono">{s.outputDirectory || g.publishDirectory || 'dist'}</dd></div></div>{(isZipUpload(app) || isRoxanneGenerated(app)) && <SourcePackageBlock app={app} />}</div><LiveLogsPanel deploymentId={deploymentId} compact /></div>; }
// ── Deploy Presets ────────────────────────────────────────────────────────────

const SETTINGS_PRESETS = [
  { id: 'static-html', label: 'Static HTML', serviceType: 'static_site', buildCommand: 'bash glondia-render-build.sh', outputDirectory: '.' },
  { id: 'vite-react', label: 'Vite React', serviceType: 'static_site', buildCommand: 'bash glondia-render-build.sh', outputDirectory: 'dist' },
  { id: 'create-react-app', label: 'CRA', serviceType: 'static_site', buildCommand: 'bash glondia-render-build.sh', outputDirectory: 'build' },
  { id: 'nextjs', label: 'Next.js', serviceType: 'web_service', runtime: 'node', buildCommand: 'npm install && npm run build', startCommand: 'npm start' },
  { id: 'express-api', label: 'Express', serviceType: 'web_service', runtime: 'node', buildCommand: 'npm install', startCommand: 'npm start' },
  { id: 'node-web-app', label: 'Node App', serviceType: 'web_service', runtime: 'node', buildCommand: 'npm install && npm run build', startCommand: 'npm start' },
];

// ── Deploy Doctor (post-deploy) ──────────────────────────────────────────────

function getSettingsDoctorChecks(form = {}) {
  const checks = [];
  const serviceType = form.serviceType || 'static_site';
  checks.push({ status: form.sourceRepository ? 'ok' : 'warn', label: form.sourceRepository ? 'Source repository set' : 'Source repository not configured', fix: null });
  checks.push({ status: form.branch ? 'ok' : 'error', label: form.branch ? `Branch: ${form.branch}` : 'Branch is required', fix: null });
  if ((form.rootDirectory || '').includes('/opt/render/project')) {
    checks.push({ status: 'error', label: 'Root directory cannot be a local Render path', fix: { label: 'Clear root', patch: { rootDirectory: '' } } });
  } else {
    checks.push({ status: form.rootDirectory ? 'ok' : 'warn', label: form.rootDirectory ? `Root: ${form.rootDirectory}` : 'Root directory not set; repo root used', fix: null });
  }
  if (serviceType === 'static_site') {
    checks.push({ status: form.buildCommand ? 'ok' : 'error', label: form.buildCommand ? 'Build command set' : 'Build command required', fix: !form.buildCommand ? { label: 'Use npm run build', patch: { buildCommand: 'npm run build' } } : null });
    checks.push({ status: form.outputDirectory ? 'ok' : 'error', label: form.outputDirectory ? `Publish: ${form.outputDirectory}` : 'Publish directory required', fix: !form.outputDirectory ? { label: 'Use dist', patch: { outputDirectory: 'dist' } } : null });
  }
  if (serviceType === 'web_service') {
    checks.push({ status: form.buildCommand ? 'ok' : 'error', label: form.buildCommand ? 'Build command set' : 'Build command required', fix: !form.buildCommand ? { label: 'Use npm install', patch: { buildCommand: 'npm install' } } : null });
    checks.push({ status: form.startCommand ? 'ok' : 'error', label: form.startCommand ? 'Start command set' : 'Start command required', fix: !form.startCommand ? { label: 'Use npm start', patch: { startCommand: 'npm start' } } : null });
    checks.push({ status: 'info', label: 'Must listen on process.env.PORT / 0.0.0.0', fix: null });
  }
  return checks;
}

function getReadinessScore(checks = []) {
  if (!checks.length) return 0;
  const max = checks.length * 2;
  const score = checks.reduce((t, c) => t + (c.status === 'ok' ? 2 : c.status === 'warn' || c.status === 'info' ? 1 : 0), 0);
  return Math.round((score / max) * 100);
}

function RenderSettingsTab({ app, deploymentId, onReload }) {
  const s = app.environmentConfiguration || {};
  const [form, setForm] = useState({
    serviceName: app.serviceName || '',
    serviceType: app.serviceType || 'static_site',
    branch: app.githubBranch || s.branch || 'main',
    rootDirectory: s.rootDirectory || '',
    buildCommand: s.buildCommand || '',
    startCommand: s.startCommand || '',
    outputDirectory: s.outputDirectory || 'dist',
    runtime: s.runtime || 'node',
    healthCheckPath: s.healthCheckPath || '/',
    plan: app.plan || s.plan || 'starter',
    region: s.region || 'oregon',
    sourceRepository: s.sourceRepository || app.repoUrl || '',
  });
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [presetNotice, setPresetNotice] = useState('');
  const [showDoctor, setShowDoctor] = useState(true);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isStatic = form.serviceType === 'static_site';
  const realService = hasRealRenderId(app.renderServiceId);

  const doctorChecks = useMemo(() => getSettingsDoctorChecks(form), [form]);
  const score = useMemo(() => getReadinessScore(doctorChecks), [doctorChecks]);
  const errors = doctorChecks.filter((c) => c.status === 'error').length;
  const warnings = doctorChecks.filter((c) => c.status === 'warn').length;

  const applyPreset = (p) => {
    setForm((f) => ({
      ...f,
      serviceType: p.serviceType || f.serviceType,
      buildCommand: p.buildCommand || f.buildCommand,
      ...(p.outputDirectory !== undefined ? { outputDirectory: p.outputDirectory } : {}),
      ...(p.startCommand !== undefined ? { startCommand: p.startCommand } : {}),
      ...(p.runtime !== undefined ? { runtime: p.runtime } : {}),
    }));
    setPresetNotice(`${p.label} preset applied`);
    setTimeout(() => setPresetNotice(''), 3000);
  };

  const applyFix = (patch = {}) => setForm((f) => ({ ...f, ...patch }));

  const runAction = async (name, fn) => {
    setBusy(name); setMsg('');
    try { await fn(); setMsg(name === 'sync' ? 'Synced with Render.' : name === 'save' ? 'Settings saved to Render.' : name === 'redeploy' ? 'Settings saved & redeploy triggered.' : name === 'clearRedeploy' ? 'Cache cleared & redeploy triggered.' : name === 'retry' ? 'Redeploy triggered.' : name === 'validate' ? 'Validation complete — see Deploy Doctor above.' : 'Done.'); onReload?.(); }
    catch (e) { setMsg(e.message || 'Action failed.'); }
    finally { setBusy(''); }
  };

  const handleSave = () => runAction('save', () => updateHostingSettings(deploymentId, form));
  const handleSaveRedeploy = () => runAction('redeploy', () => redeployHostingWithSettings(deploymentId, { ...form, clearCache: false }));
  const handleClearRedeploy = () => runAction('clearRedeploy', () => redeployHostingWithSettings(deploymentId, { ...form, clearCache: true }));
  const handleSync = () => runAction('sync', () => syncHostingDeployment(deploymentId));
  const handleRetry = () => runAction('retry', () => redeployRenderDeployment(deploymentId));

  return <div className="grid-side"><div style={{ display: 'grid', gap: 16 }}>
    {/* Settings form */}
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Render service settings</h2>

      {/* Preset chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {SETTINGS_PRESETS.map((p) => (
          <button key={p.id} className="btn btn-sm btn-outline" onClick={() => applyPreset(p)} style={{ fontSize: 11, padding: '3px 8px' }}>{p.label}</button>
        ))}
      </div>
      {presetNotice && <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 8 }}>{presetNotice}</div>}

      <div className="render-config-grid">
        <label><span>Service name</span><input className="input mono" value={form.serviceName} onChange={(e) => set('serviceName', e.target.value)} /></label>
        <label><span>Service type</span><select className="input" value={form.serviceType} onChange={(e) => set('serviceType', e.target.value)}><option value="static_site">Static Site</option><option value="web_service">Web Service</option></select></label>
        <label><span>Branch</span><input className="input mono" value={form.branch} onChange={(e) => set('branch', e.target.value)} /></label>
        <label><span>Root directory</span><input className="input mono" value={form.rootDirectory} onChange={(e) => set('rootDirectory', e.target.value)} placeholder="./" />{form.rootDirectory.includes('/opt/render/project') && <span style={{ color: 'var(--danger)', fontSize: 11 }}>Must be a repo path, not a local Render path.</span>}</label>
        <label><span>Source repository</span><input className="input mono" value={form.sourceRepository} onChange={(e) => set('sourceRepository', e.target.value)} /></label>
      </div>

      <h3 style={{ marginTop: 16 }}>{isStatic ? 'Static Site Build Settings' : 'Web Service Build & Runtime'}</h3>
      <div className="render-config-grid">
        {!isStatic && <label><span>Runtime</span><select className="input" value={form.runtime} onChange={(e) => set('runtime', e.target.value)}><option value="node">Node</option><option value="python">Python</option><option value="go">Go</option><option value="rust">Rust</option><option value="ruby">Ruby</option><option value="elixir">Elixir</option></select></label>}
        <label><span>Build command</span><input className="input mono" value={form.buildCommand} onChange={(e) => set('buildCommand', e.target.value)} placeholder={isStatic ? 'npm run build' : 'npm install && npm run build'} /></label>
        {isStatic
          ? <label><span>Publish directory</span><input className="input mono" value={form.outputDirectory} onChange={(e) => set('outputDirectory', e.target.value)} placeholder="dist" /></label>
          : <>
              <label><span>Start command</span><input className="input mono" value={form.startCommand} onChange={(e) => set('startCommand', e.target.value)} placeholder="npm start" /></label>
              <label><span>Health check path</span><input className="input mono" value={form.healthCheckPath} onChange={(e) => set('healthCheckPath', e.target.value)} placeholder="/" /></label>
            </>
        }
        <label><span>Plan</span><input className="input mono" value={form.plan} onChange={(e) => set('plan', e.target.value)} /></label>
        <label><span>Region</span><select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}><option value="oregon">Oregon (US West)</option><option value="ohio">Ohio (US East)</option><option value="frankfurt">Frankfurt (EU)</option><option value="singapore">Singapore (Asia)</option></select></label>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        <button className="btn btn-primary" disabled={!!busy || !realService} onClick={handleSave}><ICN.CheckCircle size={14} /> {busy === 'save' ? 'Saving...' : 'Save Settings'}</button>
        <button className="btn btn-primary" disabled={!!busy || !realService} onClick={handleSaveRedeploy}><ICN.Rocket size={14} /> {busy === 'redeploy' ? 'Deploying...' : 'Save & Redeploy'}</button>
        <button className="btn btn-outline" disabled={!!busy || !realService} onClick={handleClearRedeploy}><ICN.Trash size={14} /> {busy === 'clearRedeploy' ? 'Deploying...' : 'Clear Cache & Redeploy'}</button>
        <button className="btn btn-outline" disabled={!!busy || !realService} onClick={handleSync}><ICN.Refresh size={14} /> {busy === 'sync' ? 'Syncing...' : 'Sync with Render'}</button>
      </div>
      {msg && <p className="muted" style={{ marginTop: 10 }}>{msg}</p>}
    </div>

    {/* Deployment Preview */}
    <div className="card" style={{ padding: 14, background: 'var(--bg-deep)' }}>
      <div className="eyebrow">Deployment preview</div>
      <h3 style={{ margin: '4px 0 10px' }}>Render will use these settings</h3>
      <div className="kv" style={{ gridTemplateColumns: '120px 1fr' }}>
        <dt>Service name</dt><dd className="mono">{form.serviceName || app.serviceName || 'auto'}</dd>
        <dt>Type</dt><dd>{form.serviceType}</dd>
        <dt>Repo</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{form.sourceRepository || '(not set)'}</dd>
        <dt>Branch</dt><dd className="mono">{form.branch || 'main'}</dd>
        <dt>Root</dt><dd className="mono">{form.rootDirectory || 'repo root'}</dd>
        <dt>Build</dt><dd className="mono">{form.buildCommand || 'Not set'}</dd>
        {isStatic
          ? <><dt>Publish</dt><dd className="mono">{form.outputDirectory || 'Not set'}</dd></>
          : <><dt>Start</dt><dd className="mono">{form.startCommand || 'Not set'}</dd></>}
        <dt>Plan</dt><dd className="mono">{form.plan || 'starter'}</dd>
        <dt>Region</dt><dd className="mono">{form.region || 'oregon'}</dd>
      </div>
    </div>
  </div><div style={{ display: 'grid', gap: 16 }}>

    {/* Current Render record */}
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Current Render record</h2>
      <div className="kv">
        <dt>Service ID</dt><dd className="mono">{realService ? app.renderServiceId : 'Pending'}</dd>
        <dt>Deploy ID</dt><dd className="mono">{hasRealRenderId(app.renderDeployId) ? app.renderDeployId : 'Pending'}</dd>
        <dt>Source repository</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{s.sourceRepository || app.repoUrl || 'Not configured'}</dd>
        <dt>Render root</dt><dd className="mono" style={{ wordBreak: 'break-all' }}>{getRenderSourceRoot(app) || 'Not set'}</dd>
        <dt>Last synced</dt><dd>{formatDate(app.lastRenderSyncedAt)}</dd>
        <dt>Provider status</dt><dd className="mono">{app.providerStatus || app.renderDeployStatus || '—'}</dd>
      </div>
    </div>

    {/* Deploy Doctor */}
    <div className="card" style={{ padding: 14, background: 'var(--bg-deep)' }}>
      <div className="row between">
        <div><div className="eyebrow">Deploy Doctor</div><h3 style={{ margin: '4px 0 0' }}>Settings validation</h3></div>
        <div className="row" style={{ gap: 8 }}>
          <Badge tone={errors ? 'danger' : warnings ? 'warn' : 'success'} dot={false}>{errors ? `${errors} issue${errors > 1 ? 's' : ''}` : warnings ? `${warnings} warning${warnings > 1 ? 's' : ''}` : 'Ready'}</Badge>
          <Badge tone={score >= 100 ? 'success' : score >= 70 ? 'warn' : 'danger'} dot={false}>{score}%</Badge>
        </div>
      </div>
      {showDoctor && <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
        {doctorChecks.map((check, i) => (
          <div key={i} className="row between" style={{ gap: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ color: check.status === 'ok' ? 'var(--accent)' : check.status === 'error' ? 'var(--danger)' : check.status === 'warn' ? 'var(--warning)' : 'var(--text-muted)' }}>
                {check.status === 'ok' ? '✓' : check.status === 'error' ? '✗' : check.status === 'warn' ? '⚠' : '•'}
              </span>
              <span className="muted" style={{ fontSize: 13 }}>{check.label}</span>
            </div>
            {check.fix && <button className="btn btn-sm btn-outline" onClick={() => applyFix(check.fix.patch)}>{check.fix.label}</button>}
          </div>
        ))}
      </div>}
    </div>

    {/* Repair Tools */}
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Repair tools</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <button className="btn btn-outline" disabled={!!busy || !realService} onClick={handleSync}><ICN.Refresh size={14} /> Sync with Render</button>
        <button className="btn btn-outline" disabled={!!busy || !realService} onClick={handleRetry}><ICN.Refresh size={14} /> {busy === 'retry' ? 'Deploying...' : 'Retry deploy'}</button>
        <button className="btn btn-outline" disabled={!!busy || !realService} onClick={handleClearRedeploy}><ICN.Trash size={14} /> Clear cache & redeploy</button>
        <button className="btn btn-outline" onClick={() => { setShowDoctor(true); setMsg('Validation refreshed — see Deploy Doctor.'); }}><ICN.AlertCircle size={14} /> Validate settings</button>
      </div>
    </div>
  </div></div>;
}
function EnvVarsTab({ deploymentId }) { const [items, setItems] = useState([]); const [form, setForm] = useState({ key: '', value: '' }); const [msg, setMsg] = useState(''); const load = () => listHostingEnvVars(deploymentId).then(setItems).catch((e) => setMsg(e.message)); useEffect(load, [deploymentId]); const add = async () => { await upsertHostingEnvVar(deploymentId, form); setForm({ key: '', value: '' }); load(); }; return <div className="card"><h2 style={{ marginTop: 0 }}>Environment variables</h2><div className="input-group"><input className="input mono" placeholder="KEY" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} /><input className="input mono" placeholder="value" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} /><button className="btn btn-primary" onClick={add}>Add</button><button className="btn btn-outline" onClick={() => syncHostingEnvVars(deploymentId).then(load)}>Sync to Render</button></div>{msg && <p className="muted">{msg}</p>}<div className="kv" style={{ marginTop: 14 }}>{items.map((v) => <React.Fragment key={v.key}><dt className="mono">{v.key}</dt><dd><span className="mono">{v.valuePreview || 'hidden'}</span></dd></React.Fragment>)}</div></div>; }
function DisksTab({ app, deploymentId }) { const [items, setItems] = useState([]); const [form, setForm] = useState({ name: '', mountPath: '/data', sizeGB: 1 }); const load = () => listHostingDisks(deploymentId).then(setItems).catch(() => setItems([])); useEffect(load, [deploymentId]); const add = async () => { await attachHostingDisk(deploymentId, form); load(); }; return <div className="card"><h2 style={{ marginTop: 0 }}>Persistent disks</h2>{app.serviceType !== 'web_service' && <p className="muted">Disks are only available for Render web services.</p>}<div className="input-group"><input className="input" placeholder="disk name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /><input className="input mono" placeholder="/data" value={form.mountPath} onChange={(e) => setForm((f) => ({ ...f, mountPath: e.target.value }))} /><input className="input mono" type="number" value={form.sizeGB} onChange={(e) => setForm((f) => ({ ...f, sizeGB: e.target.value }))} /><button className="btn btn-primary" disabled={app.serviceType !== 'web_service'} onClick={add}>Attach</button></div><div className="kv" style={{ marginTop: 14 }}>{items.map((d) => <React.Fragment key={d.diskId}><dt>{d.name}</dt><dd className="mono">{d.mountPath} · {d.sizeGB}GB <button className="btn btn-sm btn-outline" onClick={() => updateHostingDisk(deploymentId, d.diskId, d).then(load)}>Sync</button></dd></React.Fragment>)}</div></div>; }
function DomainsTab({ deploymentId }) { const [items, setItems] = useState([]); const [domain, setDomain] = useState(''); const load = () => listHostingDomains(deploymentId).then(setItems).catch(() => setItems([])); useEffect(load, [deploymentId]); const add = async () => { await addHostingDomain(deploymentId, { domain }); setDomain(''); load(); }; return <div className="card"><h2 style={{ marginTop: 0 }}>Custom domains</h2><div className="input-group"><input className="input mono" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} /><button className="btn btn-primary" onClick={add}>Add domain</button></div><div className="kv" style={{ marginTop: 14 }}>{items.map((d) => <React.Fragment key={d.domainId}><dt className="mono">{d.name}</dt><dd>{d.status || d.verificationStatus || 'pending'} <button className="btn btn-sm btn-outline" onClick={() => verifyHostingDomain(deploymentId, d.domainId).then(load)}>Verify</button></dd></React.Fragment>)}</div></div>; }
function LiveLogsPanel({ deploymentId, compact = false }) { const [lines, setLines] = useState([]); const [streamStatus, setStreamStatus] = useState(null); const [connState, setConnState] = useState('connecting'); const bottomRef = useRef(null); const seenIds = useRef(new Set()); useEffect(() => { setLines([]); seenIds.current = new Set(); setConnState('connecting'); const es = new EventSource(getDeploymentLogStreamUrl(deploymentId)); es.addEventListener('open', () => setConnState('live')); es.addEventListener('log', (e) => { try { const log = JSON.parse(e.data); const key = log.id || `${log.source}:${log.timestamp}:${log.message}`; if (seenIds.current.has(key)) return; seenIds.current.add(key); setLines((prev) => [...prev, log]); } catch {} }); es.addEventListener('status', (e) => { try { setStreamStatus(JSON.parse(e.data)); } catch {} }); es.addEventListener('done', () => { setConnState('ended'); es.close(); }); es.addEventListener('error', () => { setConnState('error'); es.close(); }); return () => es.close(); }, [deploymentId]); useEffect(() => { if (!compact) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines.length, compact]); return <div className="card"><div className="row between" style={{ marginBottom: 10 }}><h2 style={{ margin: 0, fontSize: compact ? 14 : 18 }}>{compact ? 'Live logs' : 'Build Logs'}</h2><Badge tone={connState === 'live' ? 'success' : connState === 'error' ? 'danger' : 'muted'} dot={connState === 'live'}>{connState}</Badge></div>{streamStatus && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}><Badge tone={streamStatus.status === 'live' ? 'success' : streamStatus.status === 'failed' ? 'danger' : 'muted'} dot={false}>{streamStatus.currentStep || streamStatus.status || 'Preparing'}</Badge></div>}<div className="term" style={{ maxHeight: compact ? 220 : 520, overflowY: 'auto' }}>{lines.length === 0 && <div><span className="dim">No log lines yet.</span></div>}{lines.map((log, i) => <div key={log.id || i} style={{ display: 'flex', gap: 8, lineHeight: 1.5 }}><span className="ts" style={{ flexShrink: 0 }}>{formatTime(log.timestamp || log.createdAt)}</span><span className="dim" style={{ flexShrink: 0 }}>[{log.source === 'render' ? 'render' : 'sys'}]</span><span className={log.level === 'error' ? 'err' : log.level === 'warn' ? 'warn' : log.source === 'render' ? '' : 'dim'}>{log.message || log.msg}</span></div>)}<div ref={bottomRef} /></div></div>; }
function BillingTab({ deploymentId }) { const [billing, setBilling] = useState(null); const [loading, setLoading] = useState(true); const [fetchError, setFetchError] = useState(''); useEffect(() => { setFetchError(''); getHostingPaymentStatus(deploymentId).then(setBilling).catch((e) => setFetchError(e.message || 'Could not load billing status.')).finally(() => setLoading(false)); }, [deploymentId]); if (loading) return <div className="card" style={{ padding: 36 }}><Empty icon="CreditCard" title="Loading billing status…" /></div>; return <div className="card"><h2 style={{ marginTop: 0 }}>Billing status</h2>{fetchError && <div style={{ color: 'var(--danger)', marginBottom: 12 }}>{fetchError}</div>}<div className="kv"><dt>Status</dt><dd><Badge tone={billing?.paid ? 'success' : 'warn'}>{billing?.paymentStatus || 'pending'}</Badge></dd><dt>Grace period</dt><dd>{billing?.hoursRemaining != null ? `${billing.hoursRemaining} hours remaining` : 'Not calculated'}</dd><dt>Deadline</dt><dd>{billing?.deadlineAt ? new Date(billing.deadlineAt).toLocaleString() : 'Pending'}</dd></div></div>; }
function HostingSettings() { const [settings, setSettings] = useState(null); useEffect(() => { getRenderSettings().then(setSettings).catch(() => setSettings({ configured: false })); }, []); return <div className="card"><h2 style={{ marginTop: 0 }}>Render settings</h2><div className="kv"><dt>Provider</dt><dd>Render</dd><dt>Configured</dt><dd>{settings?.configured ? 'Yes' : 'No'}</dd><dt>Owner ID</dt><dd>{settings?.ownerIdPresent ? 'Present' : 'Missing'}</dd><dt>Missing</dt><dd>{settings?.required?.join(', ') || 'None'}</dd></div><p className="muted">Only apps deployed through Glondiasites are tracked here. Existing Render account services are not imported automatically.</p></div>; }
function statusLabel(status) { return { preparing: 'Preparing', configuration_required: 'Preparing', queued: 'Queued', building: 'Building', deploying: 'Deploying', deployed: 'Verifying URL', deployed_unverified: 'Deployed - Warming Up', live: 'Live', failed: 'Failed', suspended: 'Suspended', deleted: 'Deleted' }[status] || 'Preparing'; }
function formatDate(value) { return value ? new Date(value).toLocaleString() : '—'; }
function formatTime(value) { try { return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''; } catch { return ''; } }
