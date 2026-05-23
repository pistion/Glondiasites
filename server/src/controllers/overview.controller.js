/**
 * OverviewController
 * Aggregates workspace data for the dashboard as defined in 05_DASHBOARD_OVERVIEW_ROUTES.md
 */

const OverviewController = {
  getOverview: async (req, res) => {
    const { workspaceId } = req.params;
    
    // Mocking the OverviewPageDto
    res.ok({
      workspace: {
        id: workspaceId,
        name: "Sarah's Workspace",
        plan: "growth"
      },
      stats: {
        projectsTotal: 4,
        sitesPublished: 2,
        domainsActive: 2,
        visitors30d: 13270,
        leads30d: 86,
        orders30d: 31,
        revenue30d: 4220,
        conversionRate30d: 3.4
      },
      projects: [],
      domains: [],
      recentActivity: [
        { id: 1, who: "Sarah Kora", what: "Deployed ema-store to Production", when: "2 minutes ago", kind: "deploy" }
      ],
      nextActions: [
        { label: "Add a custom domain to improve trust.", type: "warning", link: "/domains/buy" }
      ]
    });
  },

  getStats: async (req, res) => {
    res.ok({
      visitors30d: 13270,
      leads30d: 86,
      orders30d: 31
    });
  },

  getNextActions: async (req, res) => {
    res.ok([
      { label: "Add a custom domain to improve trust.", type: "warning", link: "/domains/buy" }
    ]);
  }
};

export default OverviewController;
