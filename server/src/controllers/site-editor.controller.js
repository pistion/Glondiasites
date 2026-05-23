/**
 * SiteEditorController
 * Handles site content editing as defined in 08_BUILDER_TEMPLATES_SITES_CONTROLLER.md
 */

const SiteEditorController = {
  getEditorState: async (req, res) => {
    const { siteId } = req.params;
    res.ok({
      site: { id: siteId, name: "Ema Kora Studio", status: "draft", templateId: "linen" },
      template: { id: "linen", name: "Linen" },
      draft: { pages: [], businessInfo: {} },
      publish: { lastPublishedAt: null, liveUrl: null }
    });
  },

  saveDraft: async (req, res) => {
    res.ok({ message: "Draft saved successfully" });
  },

  autosaveDraft: async (req, res) => {
    res.ok({ message: "Autosaved" });
  }
};

export default SiteEditorController;
