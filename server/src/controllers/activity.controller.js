/**
 * ActivityController
 * Handles workspace activity and audit logs
 */

const ActivityController = {
  listActivity: async (req, res) => {
    const limit = req.query.limit || 10;
    res.ok([
      { id: 1, who: "Sarah Kora", what: "Deployed ema-store to Production", when: "2 minutes ago", kind: "deploy" },
      { id: 2, who: "Auto-renew", what: "emakora.co renewed for 1 year", when: "1 hour ago", kind: "domain" }
    ]);
  }
};

export default ActivityController;
