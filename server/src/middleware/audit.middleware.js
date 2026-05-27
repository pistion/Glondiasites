import { writeAuditLog } from '../services/auditLogService.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function auditWrites(req, res, next) {
  if (!WRITE_METHODS.has(req.method)) return next();

  const startedAt = Date.now();
  res.on('finish', async () => {
    try {
      await writeAuditLog({
        action: `${req.method} ${req.route?.path || req.path}`,
        organizationId: req.user?.organizationId || req.params?.organizationId || req.body?.organizationId || null,
        actorUserId: req.user?.id || req.body?.userId || null,
        entityType: req.baseUrl || req.path || null,
        entityId: req.params?.id || req.params?.deploymentId || req.params?.domain || null,
        status: res.statusCode >= 400 ? 'failed' : 'success',
        method: req.method,
        path: req.originalUrl || req.url,
        requestId: req.id || req.requestId || null,
        ip: req.ip || req.socket?.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
        params: req.params,
        query: req.query,
        body: req.body,
        result: { statusCode: res.statusCode, durationMs: Date.now() - startedAt },
      });
    } catch (error) {
      console.error('[audit] write middleware failed', error);
    }
  });

  return next();
}
