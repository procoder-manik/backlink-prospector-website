import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "@/components/SiteHeader";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo" aria-label="Backlink Prospector home">
              <Logo /><span>Backlink Prospector</span>
            </Link>
            <p>Competitor backlinks in, ready-to-pitch prospects out. Runs on your own computer or server.</p>
            <a className="maker-chip" href={SITE.website} target="_blank" rel="noopener author">
              <span className="maker-chip-dot" aria-hidden="true">MH</span>
              <span>Designed and built by <strong>{SITE.owner}</strong></span>
            </a>
          </div>

          <nav aria-label="Product">
            <h2>Product</h2>
            <a href="/#how">How it works</a>
            <a href="/#output">What you get</a>
            <a href="/#pricing">Plans</a>
            <a href="/#faq">Questions</a>
            <Link href="/order?plan=trial">Start free trial</Link>
            <Link href="/account">My account</Link>
          </nav>

          <nav aria-label="Support">
            <h2>Talk to us</h2>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <a href={SITE.whatsappLink} target="_blank" rel="noopener">WhatsApp {SITE.whatsapp}</a>
            <a href={SITE.booking} target="_blank" rel="noopener">Book a 30-minute call</a>
            <a href={SITE.contact} target="_blank" rel="noopener">Contact form</a>
          </nav>

          <nav aria-label="Creator">
            <h2>The maker</h2>
            <a href={SITE.website} target="_blank" rel="noopener author">{SITE.websiteLabel}</a>
            <a href={SITE.github} target="_blank" rel="noopener">GitHub</a>
            <a href="/#maker">About {SITE.owner}</a>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>© {year} <a href={SITE.website} target="_blank" rel="noopener author">{SITE.owner}</a>. All rights reserved.</p>
          <p>Ahrefs, Semrush, Hunter.io, OpenAI and Anthropic are trademarks of their owners.</p>
        </div>
      </div>
    </footer>
  );
}
