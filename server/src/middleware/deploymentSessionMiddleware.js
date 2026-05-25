import deploymentService from '../services/deploymentService.js';

export async function deploymentSessionMiddleware(req, res, next) {
  try {
    const deploymentId = req.params.deploymentId;
    if (!deploymentId) return next();
    req.deployment = await deploymentService.getDeployment(deploymentId);
    return next();
  } catch (error) {
    return next(error);
  }
}

export default deploymentSessionMiddleware;

