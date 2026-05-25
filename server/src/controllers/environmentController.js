import environmentService from '../services/environmentService.js';

const environmentController = {
  listEnvironmentVariables: async (req, res, next) => {
    try {
      res.ok(await environmentService.list(req.params.serviceId));
    } catch (error) {
      next(error);
    }
  },

  createEnvironmentVariable: async (req, res, next) => {
    try {
      res.created(await environmentService.upsert(req.params.serviceId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  updateEnvironmentVariable: async (req, res, next) => {
    try {
      res.ok(await environmentService.patch(req.params.serviceId, req.params.key, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  deleteEnvironmentVariable: async (req, res, next) => {
    try {
      res.ok(await environmentService.remove(req.params.serviceId, req.params.key));
    } catch (error) {
      next(error);
    }
  },
};

export default environmentController;

