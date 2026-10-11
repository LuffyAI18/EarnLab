const EUROPEAN_COUNTRIES = new Set([
  "AD", "AL", "AM", "AT", "AZ", "BA", "BE", "BG", "BY", "CH", "CY", "CZ",
  "DE", "DK", "EE", "ES", "FI", "FR", "GB", "GE", "GR", "HR", "HU", "IE",
  "IS", "IT", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL",
  "NO", "PL", "PT", "RO", "RS", "RU", "SE", "SI", "SK", "SM", "TR", "UA", "VA",
  "XK"
]);

function getRegion(req) {
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  if (country === "IN") return "IN";
  if (country === "US") return "US";
  if (EUROPEAN_COUNTRIES.has(country)) return "EU";
  if (country) return "US";

  const requested = String(req.query.region || "").toUpperCase();
  return ["IN", "US", "EU"].includes(requested) ? requested : "US";
}

module.exports = { getRegion };
