/**
 * PublishController
 * Handles site publishing pipeline as defined in 08_BUILDER_TEMPLATES_SITES_CONTROLLER.md
 */

const PublishController = {
  publishSite: async (req, res) => {
    res.status(202).json({
      data: { publishId: "pub_1", status: "building" },
      message: "Publishing started",
      requestId: req.id
    });
  },

  getPublishStatus: async (req, res) => {
    const { publishId } = req.params;
    res.ok({ id: publishId, status: "completed", liveUrl: "https://ema-kora.glondia.app" });
  }
};

export default PublishController;
