import hostingService from '../services/hostingService.js';

const hostingController = {
  listHosting: async (req, res, next) => {
    try {
      res.ok(await hostingService.listHosting(req.user?.id));
    } catch (error) {
      next(error);
    }
  },

  getHostingService: async (req, res, next) => {
    try {
      res.ok(await hostingService.getService(req.params.serviceId));
    } catch (error) {
      next(error);
    }
  },

  updateSettings: async (req, res, next) => {
    try {
      res.ok(await hostingService.updateSettings(req.params.serviceId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },
};

export default hostingController;

