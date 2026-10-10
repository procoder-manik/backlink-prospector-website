"use client";

import { useEffect, useRef } from "react";

// Hero backdrop: referring sites drifting as a link graph. Signals travel along the
// links towards the hub, and the odd site lights up in highlighter yellow: a keeper.
export default function LinkGraph() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true;
    let nodes = [], pulses = [];
    const mouse = { x: -9999, y: -9999 };

    function build() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(78, Math.max(28, (w * h) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.9,
        glow: 0,
      }));
      pulses = [];
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const max = Math.min(150, w / 7);

      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
        }
        n.glow = Math.max(0, n.glow - 0.008);
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            const mx = (a.x + b.x) / 2 - mouse.x, my = (a.y + b.y) / 2 - mouse.y;
            const near = Math.max(0, 1 - Math.hypot(mx, my) / 220);
            const alpha = (1 - d / max) * (0.16 + near * 0.5);
            ctx.strokeStyle = `rgba(122, 146, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (!reduce && Math.random() < 0.00055) pulses.push({ a, b, t: 0 });
          }
        }
      }

      pulses = pulses.filter((p) => p.t <= 1);
      for (const p of pulses) {
        p.t += 0.018;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, "rgba(180, 195, 255, .95)");
        g.addColorStop(1, "rgba(180, 195, 255, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        if (p.t > 1 && Math.random() < 0.35) p.b.glow = 1;
      }

      for (const n of nodes) {
        const near = Math.max(0, 1 - Math.hypot(n.x - mouse.x, n.y - mouse.y) / 180);
        if (n.glow > 0) {
          ctx.fillStyle = `rgba(255, 228, 92, ${0.25 * n.glow})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 7 * n.glow, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = n.glow > 0.05 ? `rgba(255, 228, 92, ${0.6 + n.glow * 0.4})` : `rgba(170, 186, 255, ${0.45 + near * 0.55})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + near * 1.4, 0, Math.PI * 2); ctx.fill();
      }

      if (running && !reduce) raf = requestAnimationFrame(step);
    }

    build(); step();

    const onResize = () => { build(); if (reduce) step(); };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const io = new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting && !document.hidden;
      if (running && !was && !reduce) raf = requestAnimationFrame(step);
    });
    io.observe(canvas);
    const onVis = () => {
      const was = running;
      running = !document.hidden;
      if (running && !was && !reduce) raf = requestAnimationFrame(step);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="link-graph" aria-hidden="true" />;
}
