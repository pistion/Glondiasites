/**
 * WorkspaceController
 * Handles workspace isolation and management as defined in 04_AUTH_WORKSPACE_ROUTES.md
 */

const WorkspaceController = {
  listWorkspaces: async (req, res) => {
    // Mocking workspace list
    res.ok([
      { id: "w_1", name: "Sarah's Workspace", slug: "sarah-kora", ownerId: "u_1", plan: "growth" }
    ]);
  },

  createWorkspace: async (req, res) => {
    const { name, slug } = req.body;
    res.created({
      id: "w_2",
      name,
      slug,
      ownerId: "u_1",
      plan: "free",
      createdAt: new Date().toISOString()
    });
  },

  getWorkspace: async (req, res) => {
    const { workspaceId } = req.params;
    res.ok({
      id: workspaceId,
      name: "Sarah's Workspace",
      slug: "sarah-kora",
      ownerId: "u_1",
      plan: "growth"
    });
  },

  updateWorkspace: async (req, res) => {
    const { workspaceId } = req.params;
    const dto = req.body;
    res.ok({
      id: workspaceId,
      ...dto,
      updatedAt: new Date().toISOString()
    });
  },

  deleteWorkspace: async (req, res) => {
    res.status(204).send();
  }
};

export default WorkspaceController;
