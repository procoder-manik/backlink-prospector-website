import crypto from "crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { customersCollection } from "@/lib/mongodb";

export const CUSTOMER_COOKIE = "bp_customer";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD = 8;

// Signing secret for customer sessions. Set AUTH_SECRET in production.
// Without it, a secret is derived from the other server-only settings so existing deployments keep working.
function secret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const base = `${process.env.ADMIN_PASSWORD || ""}|${process.env.MONGODB_URI || ""}`;
  if (base === "|") throw new Error("Set AUTH_SECRET (or ADMIN_PASSWORD) on the server.");
  return crypto.createHash("sha256").update(`bp-customer-v1|${base}`).digest("hex");
}

export function cleanText(value, max = 200) {
  return String(value ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
}

/* passwords: scrypt with a random salt */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const [kind, saltHex, hashHex] = stored.split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(String(password || ""), Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

export function passwordProblem(password) {
  const pw = String(password || "");
  if (pw.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (pw.length > 200) return "Use 200 characters or fewer.";
  return "";
}

/* sessions: id.expiry.version.signature, signed with HMAC */
function sign(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function sessionToken(customer) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${String(customer._id)}.${exp}.${customer.sessionVersion || 0}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 4) return null;
  const [id, exp, ver, sig] = parts;
  const expected = sign(`${id}.${exp}.${ver}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now() / 1000 || !ObjectId.isValid(id)) return null;
  return { id, version: Number(ver) };
}

export function setSession(response, customer) {
  response.cookies.set(CUSTOMER_COOKIE, sessionToken(customer), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return response;
}

export function clearSession(response) {
  response.cookies.set(CUSTOMER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

// The signed-in customer, or null. A password change or admin reset bumps
// sessionVersion, which signs out every other device.
export async function getCustomer() {
  const session = readToken(cookies().get(CUSTOMER_COOKIE)?.value);
  if (!session) return null;
  try {
    const col = await customersCollection();
    const customer = await col.findOne({ _id: new ObjectId(session.id) });
    if (!customer || (customer.sessionVersion || 0) !== session.version) return null;
    return customer;
  } catch {
    return null;
  }
}

export function publicCustomer(c) {
  return {
    id: String(c._id),
    name: c.name || "",
    email: c.email,
    phone: c.phone || "",
    company: c.company || "",
    country: c.country || "",
    createdAt: c.createdAt,
  };
}

// What a customer may see of their own order. Private admin notes are never sent.
export function publicOrder(o) {
  return {
    id: String(o._id),
    orderNumber: o.orderNumber,
    status: o.status,
    plan: o.plan,
    planName: o.planName,
    price: o.price,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    transactionId: o.transactionId || "",
    machineId: o.machineId || "",
    licenseKey: o.status === "cancelled" ? "" : o.licenseKey || "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

// A random, readable temporary password for admin resets.
export function temporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

// Only allow redirects to paths on this site.
export function safeNext(value) {
  const v = String(value || "");
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : "/account";
}
