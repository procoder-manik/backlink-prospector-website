import { NextResponse } from "next/server";
import { customersCollection } from "@/lib/mongodb";
import { cleanText, EMAIL_RE, newResetToken } from "@/lib/customer-auth";
import { sendEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const RESET_MINUTES = 30;

// Always answers the same way, so people cannot find out which emails have accounts.
const REPLY = {
  ok: true,
  message: "If an account exists for that email, we have sent a reset link. Check your inbox and spam folder.",
};

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = cleanText(body.email, 160).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  try {
    const col = await customersCollection();
    const customer = await col.findOne({ email });
    if (customer) {
      const { token, hash } = newResetToken();
      await col.updateOne(
        { _id: customer._id },
        { $set: { resetHash: hash, resetExpires: new Date(Date.now() + RESET_MINUTES * 60 * 1000) } },
      );
      const link = `${new URL(request.url).origin}/account/reset?token=${token}`;
      await sendEmail({
        to: email,
        subject: "Reset your Backlink Prospector password",
        text:
          `Hi ${customer.name || ""},\n\n` +
          `Use this link to set a new password. It works for ${RESET_MINUTES} minutes and only once:\n\n${link}\n\n` +
          `If you did not ask for this, ignore this email. Your password stays the same.`,
      });
    }
  } catch (err) {
    console.error("Forgot password failed", err);
  }

  return NextResponse.json(REPLY);
}