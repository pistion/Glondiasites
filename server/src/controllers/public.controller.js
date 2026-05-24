/**
 * PublicController
 * Handles public data and lead capture as defined in 01_UI_TO_BACKEND_MAP.md
 */

const PublicController = {
  getBrand: async (req, res) => {
    res.ok({
      name: "Glondia",
      tagline: "Hosting, domains, and starter sites — in one workspace.",
    });
  },

  getFeaturedTemplates: async (req, res) => {
    res.ok([
      { id: "linen", name: "Linen", category: "Personal" },
      { id: "harbor", name: "Harbor", category: "Small business" }
    ]);
  },

  getPlans: async (req, res) => {
    res.ok([
      { name: "Starter", price: "$0", period: "forever" },
      { name: "Growth", price: "$19", period: "per member / month" },
      { name: "Scale", price: "$49", period: "per member / month" }
    ]);
  },

  createLead: async (req, res) => {
    const { email } = req.body;
    console.log(`New lead captured: ${email}`);
    res.created({ message: "Lead captured successfully" });
  },

  createContact: async (req, res) => {
    const { name, email, message } = req.body;
    console.log(`New contact message from ${name} (${email}): ${message}`);
    res.created({ message: "Message sent successfully" });
  }
};

export default PublicController;
