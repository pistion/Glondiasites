import hostingService from '../services/hostingService.js';

export async function renderServiceMiddleware(req, res, next) {
  try {
    const serviceId = req.params.serviceId;
    if (!serviceId) return next();
    req.hostingService = await hostingService.getService(serviceId);
    return next();
  } catch (error) {
    return next(error);
  }
}

export default renderServiceMiddleware;

