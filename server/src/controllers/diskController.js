import diskService from '../services/diskService.js';

const diskController = {
  attachDisk: async (req, res, next) => {
    try {
      res.created(await diskService.attach(req.params.serviceId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  updateDisk: async (req, res, next) => {
    try {
      res.ok(await diskService.update(req.params.serviceId, req.params.diskId, req.body || {}));
    } catch (error) {
      next(error);
    }
  },

  deleteDisk: async (req, res, next) => {
    try {
      res.ok(await diskService.remove(req.params.serviceId, req.params.diskId));
    } catch (error) {
      next(error);
    }
  },
};

export default diskController;

