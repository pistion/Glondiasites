/**
 * ApiKeyController
 * Handles workspace API keys as defined in 11_BILLING_SETTINGS_NOTIFICATIONS_CONTROLLER.md
 */

const ApiKeyController = {
  listApiKeys: async (req, res) => {
    res.ok([
      { id: "ak_1", name: "Production Key", lastUsedAt: new Date().toISOString() }
    ]);
  },

  createApiKey: async (req, res) => {
    res.created({ id: "ak_new", key: "gd_live_••••••••", name: req.body.name });
  }
};

export default ApiKeyController;
