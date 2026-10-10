"use client";

import { useState } from "react";
import useTween from "@/components/useTween";

function Slider({ id, label, value, min, max, step, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider" htmlFor={id}>
      <span className="slider-top">
        <span>{label}</span>
        <output htmlFor={id}>{format(value)}</output>
      </span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} style={{ "--fill": `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default function RoiCalculator() {
  const [domains, setDomains] = useState(500);
  const [minutes, setMinutes] = useState(6);
  const [rate, setRate] = useState(20);

  const hours = (domains * minutes) / 60;
  const days = hours / 8;
  const cost = hours * rate;
  const h = useTween(hours);
  const c = useTween(cost);
  const d = useTween(days);
  const scale = Math.min(100, Math.sqrt(hours / 1000) * 100);

  return (
    <div className="roi">
      <div className="roi-inputs">
        <Slider id="domains" label="Referring domains in one export" value={domains} min={100} max={3000} step={50}
          onChange={setDomains} format={(v) => v.toLocaleString("en-US")} />
        <Slider id="minutes" label="Minutes of research per site, by hand" value={minutes} min={2} max={20} step={1}
          onChange={setMinutes} format={(v) => `${v} min`} />
        <Slider id="rate" label="Hourly cost of the person doing it" value={rate} min={5} max={100} step={5}
          onChange={setRate} format={(v) => `$${v}`} />
      </div>
      <div className="roi-result" aria-live="polite">
        <p className="roi-big">{Math.round(h).toLocaleString("en-US")} <span>hours</span></p>
        <p className="roi-line">of manual research, about {d.toFixed(1)} working days, before the first email goes out.</p>
        <div className="roi-bars" aria-hidden="true">
          <div className="roi-bar"><span className="roi-bar-label">By hand</span><span className="roi-bar-track"><span className="by-hand" style={{ width: `${Math.max(4, scale)}%` }} /></span></div>
          <div className="roi-bar"><span className="roi-bar-label">With Backlink Prospector</span><span className="roi-bar-track"><span className="with-tool" /></span></div>
        </div>
        <p className="roi-line">That is roughly <strong>${Math.round(c).toLocaleString("en-US")}</strong> of team time for one export. Backlink Prospector runs the same research in the background while your team works on something else.</p>
        <p className="roi-foot">Your own numbers will differ. Move the sliders to match your team.</p>
      </div>
    </div>
  );
}
