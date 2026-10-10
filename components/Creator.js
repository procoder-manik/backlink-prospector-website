"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import CountUp from "@/components/CountUp";

export default function Creator() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="maker" data-reveal>
      <div className="maker-photo">
        <span className="maker-initials" aria-hidden="true">MH</span>
        {imgOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={SITE.portrait} alt={`${SITE.owner}, creator of Backlink Prospector`} width="420" height="480"
            loading="lazy" onError={() => setImgOk(false)} />
        )}
        <span className="maker-badge">Available for freelance work</span>
      </div>

      <div className="maker-copy">
        <h2 id="maker-title">Built by {SITE.owner}</h2>
        <p className="maker-role">{SITE.ownerRole}, based in Bangladesh and working with clients worldwide.</p>
        <p>
          Manik has run off-page SEO and link-building outreach for client sites for years. Backlink Prospector turns
          that research routine into software, one check at a time. When you buy a license you deal with him directly:
          setup help, questions and license keys come from the person who built the tool.
        </p>

        <dl className="maker-stats">
          <div><dt><CountUp to={7} suffix="+" /></dt><dd>years building and ranking websites</dd></div>
          <div><dt><CountUp to={550} suffix="+" /></dt><dd>websites delivered</dd></div>
          <div><dt><CountUp to={185} suffix="+" /></dt><dd>clients in 14 countries</dd></div>
        </dl>

        <div className="maker-links">
          <a className="btn btn-primary" href={SITE.website} target="_blank" rel="noopener author">Visit {SITE.websiteLabel}</a>
          <a className="btn btn-quiet" href={SITE.booking} target="_blank" rel="noopener">Book a 30-minute call</a>
        </div>
        <p className="maker-contact">
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <a href={SITE.whatsappLink} target="_blank" rel="noopener">WhatsApp {SITE.whatsapp}</a>
          <a href={SITE.github} target="_blank" rel="noopener">GitHub</a>
        </p>
      </div>
    </div>
  );
}
