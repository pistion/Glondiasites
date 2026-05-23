/**
 * EventTrackingController
 * Captures granular events as defined in 10_ANALYTICS_ACTIVITY_AUDIT_CONTROLLER.md
 */

const EventTrackingController = {
  trackEvent: async (req, res) => {
    const { event, properties } = req.body;
    console.log(`Event tracked: ${event}`, properties);
    res.ok({ status: "captured" });
  },

  trackBatch: async (req, res) => {
    const { events } = req.body;
    console.log(`Batch of ${events?.length} events tracked`);
    res.ok({ status: "captured" });
  }
};

export default EventTrackingController;
