"use client";

import { useState } from "react";

// Password field with a show/hide control.
export default function PasswordInput({ value, onChange, autoComplete = "current-password", id, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <span className="pw">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete} {...rest} />
      <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
        {show ? "Hide" : "Show"}
      </button>
    </span>
  );
}
