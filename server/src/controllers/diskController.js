import diskService from '../services/diskService.js';

const diskController = {
  listDisks: async (req, res, next) => {
    try {
      res.ok(await diskService.list(req.params.deploymentId));
    } catch (error) {
      next(error);
    }
  },

  attachDisk: async (req, res, next) => {
    try {
      res.created(await diskService.attach(req.params.deploymentId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  updateDisk: async (req, res, next) => {
    try {
      res.ok(await diskService.update(req.params.deploymentId, req.params.diskId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  deleteDisk: async (req, res, next) => {
    try {
      res.ok(await diskService.remove(req.params.deploymentId, req.params.diskId));
    } catch (error) {
      next(error);
    }
  },
};

export default diskController;
