"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NAV = [
  ["/#how", "How it works"],
  ["/#output", "What you get"],
  ["/#pricing", "Plans"],
  ["/#faq", "Questions"],
  ["/#maker", "Who built it"],
];

export function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="lg-bp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5B74FF" />
          <stop offset="1" stopColor="#8A4DF0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lg-bp)" />
      <path d="M27 37l10-10M24 30l-4 4a7 7 0 0 0 10 10l4-4M40 34l4-4a7 7 0 0 0-10-10l-4 4"
        stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="47" cy="17" r="5" fill="#FFE45C" />
    </svg>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`header ${open ? "menu-open" : ""}`}>
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="Backlink Prospector home">
          <Logo />
          <span>Backlink Prospector</span>
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className="header-cta">
          <Link className="account-link" href="/account">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" /></svg>
            <span>My account</span>
          </Link>
          <Link className="btn btn-glow btn-small" href="/order?plan=trial">Start free trial</Link>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
            <span /><span />
          </button>
        </div>
      </div>
      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile" hidden={!open}>
        <div className="wrap">
          {NAV.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
          <Link href="/account" onClick={() => setOpen(false)}>My account</Link>
          <Link className="btn btn-glow" href="/order?plan=trial">Start the 7-day free trial</Link>
        </div>
      </nav>
      <span className="progress" aria-hidden="true" />
    </header>
  );
}
