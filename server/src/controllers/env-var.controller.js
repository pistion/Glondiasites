/**
 * EnvVarController
 * Handles environment variables as defined in 06_HOSTING_PROJECTS_DEPLOYMENTS_CONTROLLER.md
 */

const EnvVarController = {
  listEnvVars: async (req, res) => {
    res.ok([
      { id: "ev_1", key: "NODE_ENV", value: "production", env: ["Production"] }
    ]);
  },

  createEnvVar: async (req, res) => {
    res.created({ id: "ev_new", ...req.body });
  },

  updateEnvVar: async (req, res) => {
    const { envVarId } = req.params;
    res.ok({ id: envVarId, ...req.body });
  },

  deleteEnvVar: async (req, res) => {
    res.status(204).send();
  }
};

export default EnvVarController;
