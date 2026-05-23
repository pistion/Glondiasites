/**
 * ProjectController
 * Handles project management as defined in 06_HOSTING_PROJECTS_DEPLOYMENTS_CONTROLLER.md
 */

const ProjectController = {
  listProjects: async (req, res) => {
    const { workspaceId } = req.params;
    res.ok([
      {
        id: "p_1",
        name: "ema-store",
        framework: "Next.js",
        status: "ready",
        repo: "kora/ema-store",
        branch: "main",
        primaryDomain: "ema-store.glondia.app",
        customDomain: "shop.emakora.co",
        lastDeployAt: new Date().toISOString(),
        deployedBy: "Sarah Kora",
        region: "Sydney (syd1)",
        visitors30d: 8420,
        bandwidth30d: 28,
        requests30d: 184000
      }
    ]);
  },

  createProject: async (req, res) => {
    const { name, framework, repo } = req.body;
    res.created({
      id: "p_new",
      name,
      framework,
      status: "building",
      repo,
      createdAt: new Date().toISOString()
    });
  },

  getProject: async (req, res) => {
    const { projectId } = req.params;
    res.ok({
      id: projectId,
      name: "ema-store",
      framework: "Next.js",
      status: "ready",
      repo: "kora/ema-store"
    });
  },

  getProjectSummary: async (req, res) => {
    const { projectId } = req.params;
    res.ok({
      id: projectId,
      metrics: { visitors30d: 8420, bandwidth30d: 28 },
      recentDeployments: []
    });
  },

  updateProject: async (req, res) => {
    const { projectId } = req.params;
    res.ok({ id: projectId, ...req.body, updatedAt: new Date().toISOString() });
  },

  archiveProject: async (req, res) => {
    res.status(204).send();
  }
};

export default ProjectController;
