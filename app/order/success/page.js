import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { findPlan } from "@/lib/plans";
import { SITE } from "@/lib/site";

export const metadata = { title: "Order received" };

export default function Success({ searchParams }) {
  const number = String(searchParams?.n || "").slice(0, 20);
  const plan = findPlan(searchParams?.plan);
  const newAccount = searchParams?.new === "1";
  return (
    <>
      <SiteHeader />
      <section className="page-hero">
        <div className="wrap page-hero-inner">
          <h1>Order received</h1>
          <p>Thanks. Your {plan ? plan.name.toLowerCase() : ""} order is saved.</p>
        </div>
      </section>
      <main className="wrap success">
        <div className="success-card">
          <div className="success-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
          {number && <p className="order-number">Order number <strong>{number}</strong></p>}
          <p>We will email you within one working day with the download link and setup steps.</p>
          <div className="success-account">
            <p>
              <strong>{newAccount ? "Your account is ready." : "This order is in your account."}</strong>{" "}
              Follow its progress, send your Machine ID and copy your license key in My account.
              {newAccount && " Sign in later with your email and the password you just chose."}
            </p>
            <Link className="btn btn-glow" href="/account">Go to My account</Link>
          </div>
          <h2>What happens next</h2>
          <ol className="order-steps">
            <li>Check your inbox for our email. Look in spam if it does not arrive.</li>
            <li>Install the app and open its Activate page.</li>
            <li>Paste the Machine ID shown there into your order in My account.</li>
            <li>Copy the license key from My account when it appears, and run your first export.</li>
          </ol>
          <p>
            Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or{" "}
            <a href={SITE.whatsappLink} target="_blank" rel="noopener">WhatsApp {SITE.whatsapp}</a> with your order number.
          </p>
          <Link className="btn btn-quiet" href="/">Back to the home page</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
