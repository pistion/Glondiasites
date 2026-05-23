/**
 * LeadController
 * Handles lead capture and conversion as defined in 09_SALES_ENGINE_PRODUCTS_CHECKOUT_LEADS.md
 */

const LeadController = {
  listLeads: async (req, res) => {
    res.ok([
      { id: "l_1", name: "John Doe", email: "john@example.com", source: "facebook", status: "new" }
    ]);
  },

  createLead: async (req, res) => {
    res.created({ id: "l_new", ...req.body });
  },

  getLead: async (req, res) => {
    const { leadId } = req.params;
    res.ok({ id: leadId, name: "John Doe", status: "new" });
  },

  convertToCustomer: async (req, res) => {
    res.ok({ customerId: "c_1", message: "Lead converted to customer" });
  }
};

export default LeadController;
