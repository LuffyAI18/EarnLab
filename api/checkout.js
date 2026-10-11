const { getRegion } = require("../lib/region");

function isGumroadCheckoutUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "gumroad.com" ||
        url.hostname === "gum.co" ||
        url.hostname.endsWith(".gumroad.com"));
  } catch {
    return false;
  }
}

module.exports = (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method not allowed");
  }

  const region = getRegion(req);
  const envName = {
    IN: "GUMROAD_CHECKOUT_INR",
    US: "GUMROAD_CHECKOUT_USD",
    EU: "GUMROAD_CHECKOUT_EUR"
  }[region];
  const checkoutUrl = process.env[envName];

  res.setHeader("Cache-Control", "no-store");

  if (!checkoutUrl || !isGumroadCheckoutUrl(checkoutUrl)) {
    return res.status(503).send(
      "Checkout is not set up yet. Please try again later."
    );
  }

  return res.redirect(303, checkoutUrl);
};
