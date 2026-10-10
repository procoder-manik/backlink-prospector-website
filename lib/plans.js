// Edit prices and plan details here. Everything on the site reads from this file.

// Taka prices are worked out from the dollar price with this rate (1 USD = 123 BDT, mid-market, 2026).
// When the rate moves, change this one number and every Taka price on the site updates.
export const USD_TO_BDT = 123;

// Converts a dollar price to Taka, rounded to the nearest 10 Taka.
const toBdt = (usd) => Math.round((usd * USD_TO_BDT) / 10) * 10;

export const PLANS = [
  {
    id: "trial",
    name: "Free trial",
    usd: 0,
    period: "7 days",
    blurb: "Run it on a real competitor export before you pay anything.",
    features: ["Every feature unlocked", "1 computer", "Email support during the trial"],
    cta: "Start free trial",
  },
  {
    id: "monthly",
    name: "Monthly",
    usd: 39,
    period: "per month",
    blurb: "For freelancers who prospect a few clients at a time.",
    features: ["Unlimited clients and runs", "1 computer", "Updates while subscribed", "Email support"],
    cta: "Choose monthly",
  },
  {
    id: "yearly",
    name: "Yearly",
    usd: 349,
    period: "per year",
    blurb: "Three months cheaper than paying monthly.",
    features: ["Unlimited clients and runs", "1 computer", "All updates for 12 months", "Priority support"],
    cta: "Choose yearly",
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    usd: 499,
    period: "one payment",
    blurb: "Pay once and keep it on your computer for good.",
    features: ["Unlimited clients and runs", "1 computer", "12 months of updates included", "Setup guide and support"],
    cta: "Choose lifetime",
  },
];

export const MANAGED = {
  id: "managed",
  name: "Managed hosting",
  usd: 79,
  period: "per month",
  blurb: "We host, update and look after it on our server. Your team signs in from any browser.",
  features: ["No installation", "Team login on a private web address", "Updates and backups handled", "Priority support"],
  cta: "Ask for managed",
};

export const EXTRA_COMPUTER = "Extra computers cost 50% of the plan price each.";

// Fill in the Taka price of every plan from its dollar price.
for (const plan of [...PLANS, MANAGED]) plan.bdt = toBdt(plan.usd);

export const ALL_PLANS = [...PLANS, MANAGED];

export function findPlan(id) {
  return ALL_PLANS.find((p) => p.id === id) || null;
}

export function formatPrice(plan, currency) {
  if (plan.usd === 0) return "Free";
  return currency === "BDT"
    ? `৳${plan.bdt.toLocaleString("en-US")}`
    : `$${plan.usd.toLocaleString("en-US")}`;
}
