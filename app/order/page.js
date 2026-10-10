import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import OrderForm from "@/components/OrderForm";
import { SITE } from "@/lib/site";

export const metadata = { title: "Order Backlink Prospector" };

export default function OrderPage() {
  return (
    <>
      <SiteHeader />
      <section className="page-hero">
        <div className="wrap page-hero-inner">
          <h1>Order Backlink Prospector</h1>
          <p>Pick a plan and tell us where to send your license. We reply within one working day with download and setup instructions.</p>
        </div>
      </section>
      <main className="wrap order-page">
        <aside className="order-intro">
          <h2>How it works</h2>
          <ol className="order-steps">
            <li>Place your order on this page.</li>
            <li>Pay with the method you choose, or start the free trial.</li>
            <li>Install the app and add the Machine ID from its Activate page in My account.</li>
            <li>Copy your license key from My account, and start your first run.</li>
          </ol>
          <p className="order-help">
            Questions before you order? <a href={SITE.whatsappLink} target="_blank" rel="noopener">WhatsApp {SITE.owner}</a> or
            email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </aside>
        <Suspense fallback={<p>Loading the order form...</p>}>
          <OrderForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
