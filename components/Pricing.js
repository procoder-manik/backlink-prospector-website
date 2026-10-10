"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS, MANAGED, EXTRA_COMPUTER } from "@/lib/plans";
import CurrencySwitch from "@/components/CurrencySwitch";
import useTween from "@/components/useTween";

function Price({ plan, currency }) {
  const target = currency === "BDT" ? plan.bdt : plan.usd;
  const v = useTween(target, 520);
  if (plan.usd === 0) return <span className="amount">Free</span>;
  return (
    <span className="amount">
      {currency === "BDT" ? "৳" : "$"}{Math.round(v).toLocaleString("en-US")}
    </span>
  );
}

function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export default function Pricing() {
  const [currency, setCurrency] = useState("USD");

  return (
    <div>
      <CurrencySwitch value={currency} onChange={setCurrency} />

      <div className="plans">
        {PLANS.map((p, i) => (
          <article key={p.id} className={`plan ${p.popular ? "popular" : ""}`} onPointerMove={spotlight}
            data-reveal style={{ "--d": `${i * 80}ms` }}>
            {p.popular && <p className="plan-flag">Most chosen</p>}
            <h3>{p.name}</h3>
            <p className="plan-price">
              <Price plan={p} currency={currency} />
              <span className="period">{p.period}</span>
            </p>
            <p className="plan-blurb">{p.blurb}</p>
            <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <Link className={`btn ${p.popular ? "btn-glow" : "btn-quiet"}`}
              href={`/order?plan=${p.id}&currency=${currency}`}>{p.cta}</Link>
          </article>
        ))}
      </div>

      <article className="managed" onPointerMove={spotlight} data-reveal>
        <div>
          <h3>{MANAGED.name}</h3>
          <p>{MANAGED.blurb}</p>
          <ul>{MANAGED.features.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <div className="managed-side">
          <p className="plan-price">
            <Price plan={MANAGED} currency={currency} />
            <span className="period">{MANAGED.period}</span>
          </p>
          <Link className="btn btn-quiet" href={`/order?plan=managed&currency=${currency}`}>{MANAGED.cta}</Link>
        </div>
      </article>

      <p className="pricing-note">
        {EXTRA_COMPUTER} AI and Hunter.io usage is paid to those providers from your own accounts, so you see every cent.
      </p>
    </div>
  );
}
