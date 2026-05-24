/**
 * Request ID Middleware
 * Attaches a short random ID to every request so controllers can include
 * it in the requestId field of every response envelope.
 */

import { randomBytes } from 'node:crypto';

export const requestId = (req, res, next) => {
  req.id = randomBytes(6).toString('hex');
  res.setHeader('X-Request-Id', req.id);
  next();
};
