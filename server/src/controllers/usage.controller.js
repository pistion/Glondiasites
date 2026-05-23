/**
 * UsageController
 * Tracks resource usage against limits as defined in 11_BILLING_SETTINGS_NOTIFICATIONS_CONTROLLER.md
 */

const UsageController = {
  getSummary: async (req, res) => {
    res.ok({
      projects: { used: 4, limit: 10 },
      bandwidth: { used: "44 GB", limit: "1 TB" },
      buildMinutes: { used: 184, limit: 1000 }
    });
  }
};

export default UsageController;
