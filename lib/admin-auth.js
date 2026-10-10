import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bp_admin";

function token() {
  const pw = process.env.ADMIN_PASSWORD || "";
  return crypto.createHmac("sha256", pw).update("bp-admin-v1").digest("hex");
}

export function passwordMatches(input) {
  const pw = process.env.ADMIN_PASSWORD || "";
  if (!pw) return false;
  const a = Buffer.from(String(input || ""));
  const b = Buffer.from(pw);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sessionValue() {
  return token();
}

export function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  const value = cookies().get(ADMIN_COOKIE)?.value || "";
  const expected = token();
  return value.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
