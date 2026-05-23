/**
 * WorkspaceSettingsController
 * Handles workspace configuration as defined in 11_BILLING_SETTINGS_NOTIFICATIONS_CONTROLLER.md
 */

const WorkspaceSettingsController = {
  getSettings: async (req, res) => {
    res.ok({
      id: "w_1",
      name: "Sarah's Workspace",
      slug: "sarah-kora",
      branding: { accent: "#198754" }
    });
  },

  updateSettings: async (req, res) => {
    res.ok({ ...req.body, updatedAt: new Date().toISOString() });
  }
};

export default WorkspaceSettingsController;
