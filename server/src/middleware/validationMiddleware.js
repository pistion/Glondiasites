export function requireBody(fields = []) {
  return (req, res, next) => {
    const missing = fields.filter((field) => req.body?.[field] === undefined || req.body?.[field] === '');
    if (missing.length) {
      const error = new Error(`Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.`);
      error.status = 400;
      return next(error);
    }
    return next();
  };
}

export function validateDeploymentInput(req, res, next) {
  if (!req.body?.projectId && !req.body?.siteId && !req.body?.repoUrl && !req.body?.repositoryUrl && !req.body?.sourceReference) {
    const error = new Error('A projectId, siteId, repoUrl, repositoryUrl, or sourceReference is required to start a deployment.');
    error.status = 400;
    return next(error);
  }
  return next();
}

export default {
  requireBody,
  validateDeploymentInput,
};

