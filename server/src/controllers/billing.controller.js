/**
 * BillingController
 * Handles subscriptions and invoices as defined in 11_BILLING_SETTINGS_NOTIFICATIONS_CONTROLLER.md
 */

const BillingController = {
  getSummary: async (req, res) => {
    res.ok({
      plan: { name: "Growth", status: "active", renewsAt: "2026-06-24T00:00:00Z" },
      usage: { projects: 4, limits: { projects: 10 } },
      invoices: [
        { id: "INV-2406", date: "2026-06-01", amount: "$72.47", status: "paid" }
      ]
    });
  },

  listPlans: async (req, res) => {
    res.ok([
      { id: "starter", name: "Starter", price: 0 },
      { id: "growth", name: "Growth", price: 19 }
    ]);
  },

  listInvoices: async (req, res) => {
    res.ok([{ id: "INV-2406", amount: 72.47, status: "paid" }]);
  },

  createCheckoutSession: async (req, res) => {
    res.created({ url: "https://stripe.com/checkout/..." });
  }
};

export default BillingController;
