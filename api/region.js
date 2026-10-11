const { getRegion } = require("../lib/region");

const PRICES = {
  IN: { currency: "INR", symbol: "₹", value: "99", label: "₹99" },
  US: { currency: "USD", symbol: "$", value: "4.99", label: "$4.99" },
  EU: { currency: "EUR", symbol: "€", value: "4.99", label: "€4.99" }
};

module.exports = (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  const region = getRegion(req);
  return res.status(200).json({ region, ...PRICES[region] });
};
