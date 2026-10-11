// Sends email through Resend. In local development without a key, the email is printed in the terminal instead.
export async function sendEmail({ to, subject, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!key || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[email not sent, no RESEND_API_KEY]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
      return { dev: true };
    }
    throw new Error("Email is not configured. Set RESEND_API_KEY and MAIL_FROM.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text()}`);
  return res.json();
}