"use client";

import { useState } from "react";

const FIELDS = [
  ["score", "Fit score", "0 to 100, with the site's niche and type."],
  ["page", "Best page to pitch", "The one article where your link belongs."],
  ["why", "Why it fits", "Two sentences on the match with your client."],
  ["angle", "Pitch angle", "A hook for the email, and which of your assets to offer."],
  ["author", "Author", "The writer's name and how it was found."],
  ["email", "Verified email", "Checked for deliverability, risky ones flagged."],
  ["contact", "Contact page", "A fallback when no email exists."],
  ["comp", "Competitor link", "The page and anchor text pointing at your competitor."],
];

export default function Anatomy() {
  const [focus, setFocus] = useState(null);
  const cls = (id) => `rec-part ${focus === id ? "hl" : ""}`;

  return (
    <div className={`anatomy ${focus ? "focusing" : ""}`}>
      <dl className="fields" onMouseLeave={() => setFocus(null)}>
        {FIELDS.map(([id, name, text]) => (
          <div key={id} className={`field-item ${focus === id ? "on" : ""}`}>
            <dt>
              <button type="button" onMouseEnter={() => setFocus(id)} onFocus={() => setFocus(id)}
                onBlur={() => setFocus(null)} onClick={() => setFocus(focus === id ? null : id)}
                aria-pressed={focus === id}>
                {name}
              </button>
            </dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>

      <article className="record" aria-label="Example prospect row">
        <header className="rec-head">
          <div>
            <p className="rec-domain">storagebizjournal.com</p>
            <p className="rec-meta">Trade publication, self-storage industry, DR 52</p>
          </div>
          <span className={cls("score")}><span className="rec-score">91</span></span>
        </header>

        <div className={cls("page")}>
          <p className="rec-label">Best page to pitch</p>
          <p className="rec-link">/best-self-storage-software-2026</p>
        </div>
        <div className={cls("why")}>
          <p className="rec-label">Why it fits</p>
          <p>A 2026 roundup of storage management tools that already links to your competitor. Your product fits the list as a direct alternative.</p>
        </div>
        <div className={cls("angle")}>
          <p className="rec-label">Pitch angle</p>
          <p>Offer an updated feature comparison and a quote from your founder for the next refresh.</p>
        </div>
        <div className="rec-row">
          <div className={cls("author")}>
            <p className="rec-label">Author</p>
            <p>Dana Whitfield <small>from the article byline</small></p>
          </div>
          <div className={cls("email")}>
            <p className="rec-label">Email</p>
            <p className="rec-mail">dana@storagebizjournal.com <em>verified</em></p>
          </div>
        </div>
        <div className="rec-row">
          <div className={cls("contact")}>
            <p className="rec-label">Contact page</p>
            <p className="rec-link">/contact-the-editors</p>
          </div>
          <div className={cls("comp")}>
            <p className="rec-label">Competitor link</p>
            <p>/storage-tools <small>anchor "best storage software"</small></p>
          </div>
        </div>
      </article>
    </div>
  );
}
