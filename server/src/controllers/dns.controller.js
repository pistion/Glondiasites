/**
 * DnsRecordController
 * Handles DNS record management as defined in 07_DOMAINS_DNS_SSL_CONTROLLER.md
 */

const DnsRecordController = {
  listRecords: async (req, res) => {
    res.ok([
      { id: "rec_1", type: "A", host: "@", value: "76.76.84.21", ttl: "auto", proxied: true }
    ]);
  },

  createRecord: async (req, res) => {
    res.created({ id: "rec_new", ...req.body });
  },

  updateRecord: async (req, res) => {
    const { recordId } = req.params;
    res.ok({ id: recordId, ...req.body });
  },

  deleteRecord: async (req, res) => {
    res.status(204).send();
  }
};

export default DnsRecordController;
