/**
 * NotificationController
 * Handles system alerts and messages as defined in 11_BILLING_SETTINGS_NOTIFICATIONS_CONTROLLER.md
 */

const NotificationController = {
  listNotifications: async (req, res) => {
    res.ok([
      { id: "n_1", type: "deployment_success", message: "Project ema-store ready", read: false }
    ]);
  },

  markRead: async (req, res) => {
    res.ok({ id: req.params.notificationId, read: true });
  }
};

export default NotificationController;
