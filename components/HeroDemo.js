"use client";

import { useEffect, useRef, useState } from "react";

const STAGES = [
  { id: "upload", label: "Export", note: "Six referring domains straight from an Ahrefs export." },
  { id: "score", label: "Score fit", note: "Social platforms are skipped. AI scores the rest against your client. Two sites fail and cost nothing more." },
  { id: "page", label: "Best page", note: "The sitemap is scanned and the single best page to pitch is picked on each relevant site." },
  { id: "author", label: "Author", note: "The writer is read from the page itself, with AI only as a fallback." },
  { id: "email", label: "Email", note: "Hunter.io finds the best contact and verifies it. Catch-all servers are flagged as risky." },
  { id: "ready", label: "Ready", note: "Three prospects ready to pitch. Click a row to read why it fits." },
];

const ROWS = [
  {
    domain: "storagebizjournal.com", dr: 52, anchor: "best storage software",
    score: 91, page: "/best-self-storage-software-2026", author: "Dana Whitfield",
    email: "dana@storagebizjournal.com", emailStatus: "verified",
    why: "A 2026 roundup of storage management tools that already links to your competitor. Your product fits the list as a direct alternative.",
    angle: "Offer an updated feature comparison and a quote from your founder for the next refresh.",
  },
  {
    domain: "proptechweekly.io", dr: 61, anchor: "competitor.com",
    score: 84, page: "/tools/proptech-stack-guide", author: "Rahul Menon",
    email: "rahul.m@proptechweekly.io", emailStatus: "verified",
    why: "A guide to the software stack for property operators, with a section on storage facilities that cites one vendor only.",
    angle: "Pitch your onboarding guide as a second resource in the storage section.",
  },
  {
    domain: "dealsnmore-coupons.net", dr: 33, anchor: "click here", score: 12, fail: "Coupon site, not a fit",
  },
  {
    domain: "facebook.com", dr: 100, anchor: "competitor", skip: "Social platform, skipped",
  },
  {
    domain: "smallbizowners.blog", dr: 40, anchor: "storage software",
    score: 73, page: "/start-a-storage-business", author: "Carla Ortiz",
    email: "editor@smallbizowners.blog", emailStatus: "risky",
    why: "A step-by-step article for first-time storage owners. Readers are at the exact moment they choose software.",
    angle: "Suggest your startup checklist as the resource for the software step.",
  },
  {
    domain: "linkdirectory-list.org", dr: 28, anchor: "competitor.com", score: 8, fail: "Link directory, not a fit",
  },
];

export default function HeroDemo() {
  const [stage, setStage] = useState(0);
  const [open, setOpen] = useState(null);
  const [auto, setAuto] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setStage(STAGES.length - 1); setAuto(false); return; }
    if (!auto) return;
    timer.current = setTimeout(() => {
      setStage((s) => {
        if (s >= STAGES.length - 1) { setAuto(false); return s; }
        return s + 1;
      });
    }, stage === 0 ? 1600 : 1900);
    return () => clearTimeout(timer.current);
  }, [stage, auto]);

  const pick = (i) => { setAuto(false); setStage(i); setOpen(null); };
  const at = (name) => stage >= STAGES.findIndex((s) => s.id === name);
  const visible = ROWS.filter((r) => !(r.skip && at("score")));
  const ready = ROWS.filter((r) => r.email).length;

  const pct = (stage / (STAGES.length - 1)) * 100;

  return (
    <div className="demo" aria-label="Interactive example of a Backlink Prospector run">
      <div className="demo-bar">
        <span className="demo-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="demo-file">competitor_backlinks.csv</span>
        <span className={`demo-status ${at("ready") ? "done" : ""}`} aria-hidden="true">
          {at("ready") ? "Run complete" : "Running"}
        </span>
        <button className="demo-replay" type="button"
          onClick={() => { setStage(0); setOpen(null); setAuto(true); }}>
          Replay
        </button>
      </div>
      <div className="demo-track" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>

      <ol className="demo-steps" role="tablist">
        {STAGES.map((s, i) => (
          <li key={s.id}>
            <button type="button" role="tab" aria-selected={stage === i}
              className={`demo-step ${i < stage ? "done" : ""} ${i === stage ? "on" : ""}`}
              onClick={() => pick(i)}>
              <span className="demo-num">{i + 1}</span>{s.label}
            </button>
          </li>
        ))}
      </ol>

      <p className="demo-note" aria-live="polite" key={stage}>{STAGES[stage].note}</p>

      <div className="demo-table-wrap">
        <table className="demo-table">
          <thead>
            <tr>
              <th>Referring site</th>
              <th className="num">DR</th>
              {at("score") && <th className="num">Fit</th>}
              {at("page") && <th>Best page to pitch</th>}
              {at("author") && <th>Author</th>}
              {at("email") && <th>Email</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const failed = r.fail && at("score");
              const clickable = at("ready") && r.email;
              const isOpen = open === r.domain;
              return (
                <tr key={r.domain}
                  className={`${failed ? "failed" : ""} ${clickable ? "clickable" : ""} ${isOpen ? "open" : ""}`}
                  onClick={clickable ? () => setOpen(isOpen ? null : r.domain) : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(isOpen ? null : r.domain); } } : undefined}>
                  <td><span className="site">{r.domain}</span>
                    {!at("score") && <span className="anchor">“{r.anchor}”</span>}
                    {failed && <span className="reason">{r.fail}</span>}
                  </td>
                  <td className="num">{r.dr}</td>
                  {at("score") && <td className="num"><span className={`score ${r.score >= 55 ? "pass" : "fail"}`}>{r.score}</span></td>}
                  {at("page") && <td className="page">{r.page ? <span className="link">{r.page}</span> : <span className="dash">skipped</span>}</td>}
                  {at("author") && <td>{r.author || ""}</td>}
                  {at("email") && <td>{r.email
                    ? <span className={`mail ${r.emailStatus}`}>{r.email}<em>{r.emailStatus === "verified" ? "verified" : "risky"}</em></span>
                    : ""}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {at("ready") && (() => {
        const row = ROWS.find((r) => r.domain === open);
        return row ? (
          <div className="demo-detail">
            <p className="detail-title">Why {row.domain} fits</p>
            <p>{row.why}</p>
            <p className="detail-title">Pitch angle</p>
            <p>{row.angle}</p>
          </div>
        ) : (
          <div className="demo-summary">
            <span><strong>{ready} of 6</strong> sites are ready to pitch.</span>
            <span className="demo-files" aria-label="Files ready">
              <span className="file-pill xlsx">prospects.xlsx</span>
              <span className="file-pill csv">prospects.csv</span>
            </span>
          </div>
        );
      })()}
    </div>
  );
}
