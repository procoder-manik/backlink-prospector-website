"use client";

import { useEffect, useRef, useState } from "react";
import useTween from "@/components/useTween";

const STEPS = [
  {
    title: "Read the export",
    text: "Ahrefs or Semrush CSV, as downloaded. Encoding and columns are detected for you, many backlinks from one site become one row, and social networks, wikis and your client's own site are skipped.",
    cost: "Free", tone: "free", count: 375, unit: "sites to check",
    caption: "1,860 backlinks grouped into 412 sites. 37 social, wiki and own-site rows skipped.",
  },
  {
    title: "Score the fit",
    text: "AI reads each homepage and the page linking to your competitor, then scores fit from 0 to 100 against your client profile. Sites under your cut-off stop here, before any crawling or email credits.",
    cost: "Small AI cost", tone: "ai", count: 148, unit: "sites pass the fit score",
    caption: "227 coupon pages, directories and off-topic blogs stop here and cost nothing more.",
  },
  {
    title: "Find the best page",
    text: "robots.txt and sitemaps are read, every URL is sorted into articles, contact, about and author pages, and AI picks the one page where your link belongs. It writes the reason and a pitch angle.",
    cost: "Free crawl, then AI", tone: "ai", count: 139, unit: "pages worth pitching",
    caption: "Each one comes with two sentences on why it fits and a hook for the email.",
  },
  {
    title: "Name the author",
    text: "Structured data, meta tags, bylines and author URLs are tried first, for free. Only when they fail does AI read the About or Team page.",
    cost: "Free first", tone: "free", count: 121, unit: "authors named",
    caption: "Most names come from the page itself. AI only reads the About page when it has to.",
  },
  {
    title: "Find and verify the email",
    text: "Hunter.io looks for the author, then editors and marketers, then inboxes like editor@. Every address is verified. Catch-all servers are kept but flagged.",
    cost: "Hunter.io credits", tone: "paid", count: 104, unit: "emails found",
    caption: "92 verified and 12 flagged as risky, so nobody burns a sender on a guess.",
  },
  {
    title: "Hand over the list",
    text: "A formatted Excel workbook, a CSV that imports into Lemlist, Instantly or Pitchbox, and a file listing every skipped site with the reason.",
    cost: "Free", tone: "free", count: 104, unit: "prospects ready to pitch",
    caption: "Plus a file of all 271 skipped sites with the reason each was dropped.",
  },
];

const MAX = STEPS[0].count;

export default function Pipeline() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);
  const step = STEPS[active];
  const shown = useTween(step.count, 700);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), 4200);
    return () => clearTimeout(t);
  }, [active, auto, seen]);

  const choose = (i) => { setAuto(false); setActive(i); };

  return (
    <div className="pipeline" ref={ref}>
      <ol className="pipe-steps" aria-label="The six checks, in order">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button type="button" className={`pipe-step ${i === active ? "on" : ""} ${i < active ? "done" : ""}`}
              aria-current={i === active ? "step" : undefined} onClick={() => choose(i)}>
              <span className="pipe-n">{i + 1}</span>
              <span className="pipe-body">
                <span className="pipe-title">{s.title}<span className={`cost cost-${s.tone}`}>{s.cost}</span></span>
                <span className="pipe-text">{s.text}</span>
              </span>
              {i === active && auto && seen && <span className="pipe-timer" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ol>

      <div className="pipe-visual" aria-live="polite">
        <p className="pipe-kicker">Example run on one Ahrefs export</p>
        <p className="pipe-big"><span>{Math.round(shown).toLocaleString("en-US")}</span> {step.unit}</p>
        <p className="pipe-caption" key={active}>{step.caption}</p>
        <div className="funnel" aria-hidden="true">
          {STEPS.map((s, i) => (
            <button type="button" tabIndex={-1} key={s.title} onClick={() => choose(i)}
              className={`funnel-row ${i <= active ? "lit" : ""} ${i === active ? "on" : ""}`}>
              <span className="funnel-label">{s.title}</span>
              <span className="funnel-bar"><span style={{ width: `${Math.max(6, (s.count / MAX) * 100)}%` }} /></span>
              <span className="funnel-num">{s.count}</span>
            </button>
          ))}
        </div>
        <p className="pipe-foot">Cheap checks run first, so paid lookups only happen on sites that already passed. Your numbers depend on the niche.</p>
      </div>
    </div>
  );
}
