/**
 * TemplateController
 * Handles template gallery data as defined in 08_BUILDER_TEMPLATES_SITES_CONTROLLER.md
 */

const TemplateController = {
  listTemplates: async (req, res) => {
    res.ok([
      { id: "linen", name: "Linen", category: "Personal", tagline: "Quiet portfolio with a serif voice." },
      { id: "harbor", name: "Harbor", category: "Small business", tagline: "Trades and service business landing." }
    ]);
  },

  listCategories: async (req, res) => {
    res.ok(["Personal", "Small business", "Restaurant", "Photography", "Agency", "Blog", "SaaS", "Event", "Nonprofit"]);
  },

  getTemplate: async (req, res) => {
    const { templateId } = req.params;
    res.ok({ id: templateId, name: "Linen", category: "Personal" });
  },

  getTemplatePreview: async (req, res) => {
    res.ok({ previewUrl: "https://glondia.app/previews/linen.jpg" });
  }
};

export default TemplateController;
