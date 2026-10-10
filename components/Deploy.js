"use client";

import { useState } from "react";

const OPTIONS = [
  {
    id: "pc", name: "Windows PC", time: "About 5 minutes",
    lines: ["Download the one-click installer", "Open the app and copy your Machine ID", "Paste the license key we send back", "Upload your first export"],
    note: "Best for freelancers and small teams working from one machine.",
  },
  {
    id: "server", name: "Your own domain", time: "About 20 minutes",
    lines: ["Rent a small cloud server", "Start the Docker setup", "Point your domain at it, HTTPS is free", "Your team signs in from any browser"],
    note: "Best for agencies that want one shared address for everyone.",
  },
  {
    id: "managed", name: "Managed by us", time: "Same day",
    lines: ["Choose the managed plan", "We set it up on our server", "You get a private web address and team login", "Updates and backups are handled"],
    note: "Best when nobody on the team wants to look after a server.",
  },
];

export default function Deploy() {
  const [tab, setTab] = useState("pc");
  const opt = OPTIONS.find((o) => o.id === tab);

  const onKey = (e) => {
    const i = OPTIONS.findIndex((o) => o.id === tab);
    if (e.key === "ArrowRight") setTab(OPTIONS[(i + 1) % OPTIONS.length].id);
    if (e.key === "ArrowLeft") setTab(OPTIONS[(i - 1 + OPTIONS.length) % OPTIONS.length].id);
  };

  return (
    <div className="deploy">
      <div className="deploy-tabs" role="tablist" aria-label="Where it runs" onKeyDown={onKey}>
        {OPTIONS.map((o) => (
          <button key={o.id} type="button" role="tab" id={`tab-${o.id}`} aria-selected={tab === o.id}
            aria-controls="deploy-panel" tabIndex={tab === o.id ? 0 : -1}
            className={tab === o.id ? "on" : ""} onClick={() => setTab(o.id)}>
            {o.name}
          </button>
        ))}
      </div>
      <div className="deploy-panel" id="deploy-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab}>
        <p className="deploy-time"><span className="pulse-dot" aria-hidden="true" />{opt.time}</p>
        <ol>
          {opt.lines.map((l, i) => <li key={l} style={{ animationDelay: `${i * 70}ms` }}>{l}</li>)}
        </ol>
        <p className="deploy-note">{opt.note}</p>
      </div>
    </div>
  );
}
