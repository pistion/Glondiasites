/**
 * PublicSalesController
 * Powers published SME pages as defined in 09_SALES_ENGINE_PRODUCTS_CHECKOUT_LEADS.md
 */

const PublicSalesController = {
  getPublishedSite: async (req, res) => {
    const { siteSlug } = req.params;
    res.ok({ slug: siteSlug, name: "SME Store", theme: "linen" });
  },

  listPublicProducts: async (req, res) => {
    res.ok([
      { id: "p_1", name: "Hand-thrown Vase", price: 45.00, currency: "USD" }
    ]);
  },

  getPublicProduct: async (req, res) => {
    const { productSlug } = req.params;
    res.ok({ slug: productSlug, name: "Hand-thrown Vase", price: 45.00 });
  },

  createLead: async (req, res) => {
    res.created({ message: "Inquiry received" });
  },

  createCheckout: async (req, res) => {
    res.created({ checkoutId: "ch_1", checkoutUrl: "https://glondia.app/checkout/ch_1" });
  }
};

export default PublicSalesController;
