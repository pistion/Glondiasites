/**
 * ProductController
 * Handles catalog management as defined in 09_SALES_ENGINE_PRODUCTS_CHECKOUT_LEADS.md
 */

const ProductController = {
  listProducts: async (req, res) => {
    res.ok([
      { id: "p_1", name: "Hand-thrown Vase", price: 45.00, status: "active" }
    ]);
  },

  createProduct: async (req, res) => {
    res.created({ id: "p_new", ...req.body });
  },

  getProduct: async (req, res) => {
    const { productId } = req.params;
    res.ok({ id: productId, name: "Hand-thrown Vase", price: 45.00 });
  },

  updateProduct: async (req, res) => {
    const { productId } = req.params;
    res.ok({ id: productId, ...req.body });
  }
};

export default ProductController;
