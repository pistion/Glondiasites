import domainService from '../services/domainService.js';

const domainController = {
  addDomain: async (req, res, next) => {
    try {
      res.created(await domainService.add(req.params.deploymentId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  listDomains: async (req, res, next) => {
    try {
      res.ok(await domainService.list(req.params.deploymentId));
    } catch (error) {
      next(error);
    }
  },

  getDomainStatus: async (req, res, next) => {
    try {
      res.ok(await domainService.status(req.params.deploymentId, req.params.domainId));
    } catch (error) {
      next(error);
    }
  },

  deleteDomain: async (req, res, next) => {
    try {
      res.ok(await domainService.remove(req.params.deploymentId, req.params.domainId));
    } catch (error) {
      next(error);
    }
  },
};

export default domainController;
