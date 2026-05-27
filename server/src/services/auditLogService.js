import { prisma } from './db.js';

const SENSITIVE_KEYS = new Set([
  'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
  'apiKey', 'secret', 'authorization', 'cookie', 'paypalClientSecret',
  'renderApiKey', 'spaceshipApiSecret', 'githubToken',
]);

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (SENSITIVE_KEYS.has(key) || /password|secret|token|key|authorization|cookie/i.test(key)) {
        return [key, '[REDACTED]'];
      }
      return [key, redact(item)];
    }),
  );
}

export async function writeAuditLog(input = {}, tx = prisma) {
  if (String(process.env.AUDIT_LOG_ENABLED || 'true').toLowerCase() === 'false') return null;
  if (!tx.auditLog?.create) return null;

  const metadata = {
    requestId: input.requestId || null,
    ip: input.ip || null,
    userAgent: input.userAgent || null,
    params: redact(input.params || {}),
    query: redact(input.query || {}),
    body: redact(input.body || {}),
    result: redact(input.result || {}),
    error: input.error ? { name: input.error.name, message: input.error.message, code: input.error.code, status: input.error.status } : null,
  };

  return tx.auditLog.create({
    data: {
      organizationId: input.organizationId || null,
      actorUserId: input.actorUserId || null,
      action: input.action || 'unknown',
      entityType: input.entityType || null,
      entityId: input.entityId || null,
      status: input.status || 'success',
      method: input.method || null,
      path: input.path || null,
      metadata: JSON.stringify(metadata),
    },
  });
}
