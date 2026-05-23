/**
 * OrderController
 * Handles workspace orders as defined in 09_SALES_ENGINE_PRODUCTS_CHECKOUT_LEADS.md
 */

const OrderController = {
  listOrders: async (req, res) => {
    res.ok([
      { id: "o_1", total: 45.00, status: "paid", customer: "John Doe" }
    ]);
  },

  getOrder: async (req, res) => {
    const { orderId } = req.params;
    res.ok({ id: orderId, total: 45.00, status: "paid" });
  },

  updateStatus: async (req, res) => {
    const { orderId } = req.params;
    res.ok({ id: orderId, status: req.body.status });
  }
};

export default OrderController;
