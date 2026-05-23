/**
 * SiteController
 * Handles workspace site projects as defined in 08_BUILDER_TEMPLATES_SITES_CONTROLLER.md
 */

const SiteController = {
  listSites: async (req, res) => {
    res.ok([
      { id: "s_1", name: "Ema Kora Studio", status: "published", templateId: "linen" }
    ]);
  },

  createSite: async (req, res) => {
    res.created({ id: "s_new", ...req.body });
  },

  createFromTemplate: async (req, res) => {
    const { templateId, siteName } = req.body;
    res.created({
      id: "s_from_tpl",
      name: siteName,
      templateId,
      status: "draft",
      createdAt: new Date().toISOString()
    });
  },

  getSite: async (req, res) => {
    const { siteId } = req.params;
    res.ok({ id: siteId, name: "Ema Kora Studio", status: "published" });
  },

  updateSite: async (req, res) => {
    const { siteId } = req.params;
    res.ok({ id: siteId, ...req.body });
  },

  deleteSite: async (req, res) => {
    res.status(204).send();
  }
};

export default SiteController;
