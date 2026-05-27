import { withCompensatingTransaction, withTransaction } from './db.js';
import { writeAuditLog } from './auditLogService.js';

export async function atomic(actionName, callback, options = {}) {
  return withTransaction(async (tx) => {
    const result = await callback(tx);
    await writeAuditLog({
      action: actionName,
      organizationId: options.organizationId || result?.organizationId || null,
      actorUserId: options.actorUserId || result?.createdByUserId || result?.userId || null,
      entityType: options.entityType || null,
      entityId: options.entityId || result?.id || result?.deploymentId || null,
      status: 'success',
      result: options.auditResult ? result : {},
    }, tx);
    return result;
  }, options);
}

export async function atomicWithCompensation(actionName, callback, options = {}) {
  return withCompensatingTransaction({
    transaction: async (tx, addCompensation) => {
      const result = await callback(tx, addCompensation);
      await writeAuditLog({
        action: actionName,
        organizationId: options.organizationId || result?.organizationId || null,
        actorUserId: options.actorUserId || result?.createdByUserId || result?.userId || null,
        entityType: options.entityType || null,
        entityId: options.entityId || result?.id || result?.deploymentId || null,
        status: 'success',
        result: options.auditResult ? result : {},
      }, tx);
      return result;
    },
    compensate: async (error) => {
      await writeAuditLog({
        action: `${actionName}.compensated`,
        organizationId: options.organizationId || null,
        actorUserId: options.actorUserId || null,
        entityType: options.entityType || null,
        entityId: options.entityId || null,
        status: 'failed',
        error,
      });
    },
  });
}
