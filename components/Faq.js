"use client";

import { useState } from "react";

export default function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list">
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q} className={`faq-item ${isOpen ? "open" : ""}`}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} id={`faq-q-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="faq-panel" id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
              <div><p>{a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
