/**
 * DomainSearchController
 * Handles public domain search and pricing as defined in 07_DOMAINS_DNS_SSL_CONTROLLER.md
 */

const DomainSearchController = {
  searchAvailability: async (req, res) => {
    const { query } = req.query;
    const base = query.toLowerCase().replace(/[^a-z0-9-]/g, "");
    res.ok([
      { name: base + ".com", available: false, price: 14.99 },
      { name: base + ".net", available: true, price: 11.99 },
      { name: base + ".org", available: true, price: 12.49 },
      { name: base + ".app", available: true, price: 16.99 }
    ]);
  },

  getPricing: async (req, res) => {
    res.ok([
      { tld: ".com", price: 14.99, renewal: 16.99 },
      { tld: ".app", price: 16.99, renewal: 18.99 }
    ]);
  },

  getSuggestions: async (req, res) => {
    const { query } = req.query;
    res.ok([
      { name: query + "-shop.com", price: 14.99 },
      { name: "get-" + query + ".com", price: 14.99 }
    ]);
  }
};

export default DomainSearchController;
