"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPassword({ token }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    const res = await fetch("/api/account/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : { error: "No connection. Try again." };
    setBusy(false);
    if (res?.ok) {
      router.push("/account");
      router.refresh();
      return;
    }
    setError(data.fields?.password || data.error || "Could not reset the password.");
  }

  return (
    <>
      <section className="page-hero">
        <div className="wrap page-hero-inner">
          <h1>Set a new password</h1>
          <p>Choose a password you have not used before. It signs you in on this device straight away.</p>
        </div>
      </section>

      <main className="wrap account-page auth-page">
        <div className="auth-card">
          {!token ? (
            <>
              <p className="form-message">This link is incomplete. Request a new reset link.</p>
              <p className="auth-foot">
                <Link href="/account">Back to sign in</Link>
              </p>
            </>
          ) : (
            <form className="auth-form" onSubmit={submit} noValidate>
              <label className="field">
                <span className="field-label">New password</span>
                <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required autoFocus />
                <span className="field-hint">At least 8 characters.</span>
              </label>
              <label className="field">
                <span className="field-label">Repeat new password</span>
                <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
              </label>
              {error && <p className="form-message" role="alert">{error}</p>}
              <button className="btn btn-glow" type="submit" disabled={busy}>
                {busy ? "Saving..." : "Save new password"}
              </button>
              <p className="auth-foot">
                <Link href="/account">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
        <aside className="auth-side">
          <h2>After you save</h2>
          <ul className="trust-list">
            <li><strong>You are signed in.</strong> Your orders and license keys open straight away.</li>
            <li><strong>Other devices sign out.</strong> Anyone still signed in elsewhere has to sign in again.</li>
            <li><strong>The link stops working.</strong> A reset link works once and expires after 30 minutes.</li>
          </ul>
        </aside>
      </main>
    </>
  );
}