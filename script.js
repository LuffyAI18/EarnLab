/* EarnLab landing page behavior and regional pricing. */

const PAYMENT_ENDPOINT = window.location.protocol === "file:" || window.location.hostname === "localhost" ? null : "/api/checkout";
let currentPrice = detectPriceConfig();

function detectPriceConfig(regionCode) {
  if (regionCode === "IN") return { currency: "INR", symbol: "₹", value: "99", label: "₹99", region: "IN" };
  if (regionCode === "EU") return { currency: "EUR", symbol: "€", value: "4.99", label: "€4.99", region: "EU" };
  if (regionCode === "US") return { currency: "USD", symbol: "$", value: "4.99", label: "$4.99", region: "US" };

  const locale = (navigator.language || navigator.languages?.[0] || "en-IN").toLowerCase();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const timezoneLower = timezone.toLowerCase();
  const region = (locale.split("-")[1] || "").toUpperCase();

  const europe = new Set([
    "AD","AL","AM","AT","AZ","BA","BE","BG","BY","CH","CY","CZ","DE","DK",
    "EE","ES","FI","FR","GB","GE","GR","HR","HU","IE","IS","IT","LT","LU",
    "LV","MD","ME","MK","MT","NL","NO","PL","PT","RO","RS","SE","SI","SK",
    "TR","UA","XK"
  ]);

  if (region === "IN" || locale.startsWith("hi") || timezoneLower.includes("india") || timezoneLower.includes("calcutta") || timezoneLower.includes("kolkata")) {
    return { currency: "INR", symbol: "₹", value: "99", label: "₹99", region: "IN" };
  }

  if (timezoneLower.startsWith("europe/") || europe.has(region) || locale.startsWith("fr") || locale.startsWith("de") || locale.startsWith("es") || locale.startsWith("it") || locale.startsWith("pt")) {
    return { currency: "EUR", symbol: "€", value: "4.99", label: "€4.99", region: "EU" };
  }

  if (region === "US" || locale.startsWith("en-us") || locale.startsWith("es-us") || timezoneLower.startsWith("america/")) {
    return { currency: "USD", symbol: "$", value: "4.99", label: "$4.99", region: "US" };
  }

  return { currency: "USD", symbol: "$", value: "4.99", label: "$4.99", region: "US" };
}

function applyPricing(price) {
  currentPrice = price;
  const formattedMeta = `Instant PDF download, ${price.label}.`;

  const title = document.querySelector("title");
  if (title) title.textContent = `EarnLab — The Student Income Playbook | ${price.label}`;

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", `83 realistic ways college students can earn while studying. A 90-page practical playbook — skills, clients, AI, scams to avoid, and a 30-day challenge. ${formattedMeta}`);

  document.querySelectorAll(".js-price-symbol").forEach((el) => {
    el.textContent = price.symbol;
  });

  document.querySelectorAll(".js-price-value").forEach((el) => {
    el.textContent = price.value;
  });

  document.querySelectorAll(".js-price-label").forEach((el) => {
    el.textContent = price.label;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyPricing(currentPrice);
  syncPricingWithVercelLocation();
  wireBuyButtons();
  wireNav();
  wireScrollShadow();
  wireAccordion();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

async function syncPricingWithVercelLocation() {
  if (!PAYMENT_ENDPOINT) return;

  try {
    const response = await fetch("/api/region", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Location lookup failed with status ${response.status}`);
    }

    const data = await response.json();
    const price = detectPriceConfig(data.region);
    applyPricing(price);
  } catch (error) {
    console.error("Could not sync displayed pricing with Vercel's detected country.", error);
  }
}

/* Send production purchases through the country-aware checkout endpoint. */
function wireBuyButtons() {
  document.querySelectorAll("[data-buy]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (PAYMENT_ENDPOINT) {
        e.preventDefault();
        window.location.href = `${PAYMENT_ENDPOINT}?region=${currentPrice.region}`;
      }
    });
  });
}

/* Mobile hamburger menu */
function wireNav() {
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  if (!burger || !links) return;

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );
}

/* Add a shadow/border under the nav once the page scrolls */
function wireScrollShadow() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const toggle = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}

/* FAQ accordion — one open at a time, height-animated */
function wireAccordion() {
  const items = document.querySelectorAll(".acc__item");
  items.forEach((item) => {
    const q = item.querySelector(".acc__q");
    const a = item.querySelector(".acc__a");
    if (!q || !a) return;

    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        other.classList.remove("is-open");
        const otherA = other.querySelector(".acc__a");
        if (otherA) otherA.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("is-open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}
