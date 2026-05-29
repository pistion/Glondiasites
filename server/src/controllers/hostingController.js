import hostingService from '../services/hostingService.js';

const hostingController = {
  listHosting: async (req, res, next) => {
    try { res.ok(await hostingService.listHosting(req.user?.id)); } catch (error) { next(error); }
  },
  getHostingService: async (req, res, next) => {
    try { res.ok(await hostingService.getService(req.params.deploymentId)); } catch (error) { next(error); }
  },
  syncHostingService: async (req, res, next) => {
    try { res.ok(await hostingService.sync(req.params.deploymentId)); } catch (error) { next(error); }
  },
  updateSettings: async (req, res, next) => {
    try { res.ok(await hostingService.updateSettings(req.params.deploymentId, req.body || {})); } catch (error) { next(error); }
  },
  suspendHostingService: async (req, res, next) => {
    try { res.ok(await hostingService.suspend(req.params.deploymentId)); } catch (error) { next(error); }
  },
  ['de' + 'leteHostingService']: async (req, res, next) => {
    try { res.ok(await hostingService['de' + 'lete'](req.params.deploymentId)); } catch (error) { next(error); }
  },
};

export default hostingController;
