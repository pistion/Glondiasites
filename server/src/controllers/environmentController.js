import environmentService from '../services/environmentService.js';

const environmentController = {
  listEnvironmentVariables: async (req, res, next) => {
    try {
      res.ok(await environmentService.list(req.params.deploymentId));
    } catch (error) {
      next(error);
    }
  },

  createEnvironmentVariable: async (req, res, next) => {
    try {
      res.created(await environmentService.upsert(req.params.deploymentId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  updateEnvironmentVariable: async (req, res, next) => {
    try {
      res.ok(await environmentService.patch(req.params.deploymentId, req.params.key, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  deleteEnvironmentVariable: async (req, res, next) => {
    try {
      res.ok(await environmentService.remove(req.params.deploymentId, req.params.key));
    } catch (error) {
      next(error);
    }
  },

  syncEnvironmentVariables: async (req, res, next) => {
    try {
      res.ok(await environmentService.sync(req.params.deploymentId));
    } catch (error) {
      next(error);
    }
  },
};

export default environmentController;
