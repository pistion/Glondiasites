/**
 * PublicController
 * Handles public data and lead capture as defined in 01_UI_TO_BACKEND_MAP.md
 */

const PublicController = {
  getBrand: async (req, res) => {
    // Mocking public brand data
    res.json({
      data: {
        name: "Glondia",
        tagline: "Hosting, domains, and starter sites — in one workspace.",
      },
      requestId: req.id
    });
  },

  getFeaturedTemplates: async (req, res) => {
    // Mocking featured templates
    res.json({
      data: [
        { id: "linen", name: "Linen", category: "Personal" },
        { id: "harbor", name: "Harbor", category: "Small business" }
      ],
      requestId: req.id
    });
  },

  getPlans: async (req, res) => {
    // Mocking pricing plans
    res.json({
      data: [
        { name: "Starter", price: "$0", period: "forever" },
        { name: "Growth", price: "$19", period: "per member / month" },
        { name: "Scale", price: "$49", period: "per member / month" }
      ],
      requestId: req.id
    });
  },

  createLead: async (req, res) => {
    const { email } = req.body;
    console.log(`New lead captured: ${email}`);
    res.status(201).json({
      message: "Lead captured successfully",
      requestId: req.id
    });
  },

  createContact: async (req, res) => {
    const { name, email, message } = req.body;
    console.log(`New contact message from ${name} (${email}): ${message}`);
    res.status(201).json({
      message: "Message sent successfully",
      requestId: req.id
    });
  }
};

export default PublicController;
