/**
 * TemplateController
 * Returns the two production HTML templates: Pulse Works and Forge.
 */

const TEMPLATES = [
  {
    id:       "pulse-works",
    name:     "Pulse Works",
    category: "Fashion",
    tagline:  "Drop-based streetwear. No restocks, ever.",
    accent:   "#ff3a17",
    surface:  "#0e0d0c",
    motif:    "html-dark",
    isHtmlTemplate: true,
  },
  {
    id:       "forge",
    name:     "Forge",
    category: "Outdoor",
    tagline:  "Work-worthy gear. Built for the tenth season.",
    accent:   "#d4ff3a",
    surface:  "#111210",
    motif:    "html-dark",
    isHtmlTemplate: true,
  },
];

const TemplateController = {
  listTemplates: async (req, res) => {
    res.ok(TEMPLATES);
  },

  listCategories: async (req, res) => {
    res.ok([...new Set(TEMPLATES.map((t) => t.category))]);
  },

  getTemplate: async (req, res) => {
    const tpl = TEMPLATES.find((t) => t.id === req.params.templateId);
    if (!tpl) return res.status(404).json({ error: 'Template not found.' });
    res.ok(tpl);
  },

  getTemplatePreview: async (req, res) => {
    const tpl = TEMPLATES.find((t) => t.id === req.params.templateId);
    if (!tpl) return res.status(404).json({ error: 'Template not found.' });
    // Return real template metadata. Actual HTML is bundled on the frontend
    // in src/templates/html/ and rendered via sandboxed iframe.
    res.ok({
      templateId:      tpl.id,
      name:            tpl.name,
      category:        tpl.category,
      tagline:         tpl.tagline,
      previewAvailable: true,
      previewType:     'html-iframe',
      note:            'Template HTML is available in the frontend bundle at contentJson.pages[n].html.',
    });
  },
};

export default TemplateController;
