"use client";

import { useEffect, useRef, useState } from "react";

// Smoothly animates a number towards `target` whenever it changes.
export default function useTween(target, duration = 450) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = target; setValue(target); return;
    }
    const start = performance.now();
    const begin = from.current;
    cancelAnimationFrame(frame.current);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = begin + (target - begin) * (1 - Math.pow(1 - t, 3));
      from.current = v;
      setValue(v);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}
