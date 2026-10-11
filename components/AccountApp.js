"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_METHODS, SITE } from "@/lib/site";
import PasswordInput from "@/components/PasswordInput";

function Field({ label, error, hint, children }) {
  return (
    <label className={`field ${error ? "has-error" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

async function send(url, method, body) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/* ---------- signed out: sign in or create an account ---------- */

function AuthCard({ onDone }) {
  const [mode, setMode] = useState("signin"); // signin | register | forgot
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const switchTo = (m) => { setMode(m); setErrors({}); setMessage(""); setNotice(""); };

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErrors({}); setMessage(""); setNotice("");

    if (mode === "forgot") {
      const { ok, data } = await send("/api/account/forgot", "POST", { email: form.email })
        .catch(() => ({ ok: false, data: { error: "No connection. Check your internet and try again." } }));
      setBusy(false);
      if (ok) setNotice(data.message);
      else { setErrors(data.fields || {}); setMessage(data.error || "Something went wrong. Try again."); }
      return;
    }

    const { ok, data } = await send(mode === "signin" ? "/api/account/login" : "/api/account/register", "POST", form)
      .catch(() => ({ ok: false, data: { error: "No connection. Check your internet and try again." } }));
    setBusy(false);
    if (ok) return onDone();
    setErrors(data.fields || {});
    setMessage(data.error || "Something went wrong. Try again.");
  }

  if (mode === "forgot") {
    return (
      <div className="auth-card">
        <h2 className="reset-title">Reset your password</h2>
        <p className="auth-foot" style={{ marginTop: 0, marginBottom: 20 }}>
          Enter the email you order with. We send a link that works for 30 minutes.
        </p>
        <form className="auth-form" onSubmit={submit} noValidate>
          <Field label="Email" error={errors.email}>
            <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required autoFocus />
          </Field>
          {notice && <p className="account-note" role="status">{notice}</p>}
          {message && <p className="form-message" role="alert">{message}</p>}
          <button className="btn btn-glow" type="submit" disabled={busy}>
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <p className="auth-foot">
          <button type="button" className="link-btn" onClick={() => switchTo("signin")}>Back to sign in</button>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist" aria-label="Account">
        <span className={`auth-pill ${mode === "register" ? "right" : ""}`} aria-hidden="true" />
        <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => switchTo("signin")}>Sign in</button>
        <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchTo("register")}>Create account</button>
      </div>

      <form className="auth-form" onSubmit={submit} noValidate key={mode}>
        {mode === "register" && (
          <Field label="Full name" error={errors.name}>
            <input value={form.name} onChange={set("name")} autoComplete="name" required />
          </Field>
        )}
        <Field label="Email" error={errors.email} hint={mode === "register" ? "Use the email you order with." : undefined}>
          <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required autoFocus />
        </Field>
        <Field label="Password" error={errors.password} hint={mode === "register" ? "At least 8 characters." : undefined}>
          <PasswordInput value={form.password} onChange={set("password")} autoComplete={mode === "signin" ? "current-password" : "new-password"} required />
        </Field>
        {message && <p className="form-message" role="alert">{message}</p>}
        <button className="btn btn-glow" type="submit" disabled={busy}>
          {busy ? "One moment..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      {mode === "signin" ? (
        <p className="auth-foot">
          <button type="button" className="link-btn" onClick={() => switchTo("forgot")}>Forgot password?</button>
        </p>
      ) : (
        <p className="auth-foot">Ordered before? Create the account with the same email, then add the order with its order number.</p>
      )}
    </div>
  );
}
/* ---------- one order ---------- */

const STEPS = [
  ["new", "Order placed"],
  ["contacted", "We contacted you"],
  ["paid", "Payment confirmed"],
  ["licensed", "License key sent"],
];
const RANK = { new: 0, contacted: 1, paid: 2, licensed: 3 };
const STATUS_LABEL = { new: "Order placed", contacted: "In progress", paid: "Payment confirmed", licensed: "License ready", cancelled: "Cancelled" };

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    setDone(true); setTimeout(() => setDone(false), 1800);
  }
  return <button type="button" className={`btn btn-small ${done ? "btn-done" : "btn-primary"}`} onClick={copy}>{done ? "Copied" : "Copy key"}</button>;
}

function OrderCard({ order, onChange }) {
  const free = order.price === "Free";
  const cancelled = order.status === "cancelled";
  const rank = RANK[order.status] ?? 0;
  const method = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
  const [machineId, setMachineId] = useState(order.machineId);
  const [trx, setTrx] = useState(order.transactionId);
  const [msg, setMsg] = useState({});
  const date = new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  async function save(field, value) {
    setMsg({ [field]: "Saving..." });
    const { ok, data } = await send(`/api/account/orders/${order.id}`, "PATCH", { [field]: value });
    if (ok) { onChange(data.order); setMsg({ [field]: "Saved. We can see it now." }); }
    else setMsg({ [field]: data.fields?.[field] || data.error || "Not saved. Try again." });
  }

  const canSendMachine = !cancelled && order.status !== "licensed";
  const canSendTrx = !cancelled && !free && ["bkash", "nagad", "bank"].includes(order.paymentMethod) && rank < 2;

  return (
    <article className={`order-card status-${order.status}`}>
      <header className="oc-head">
        <div>
          <h3>{order.planName}</h3>
          <p className="oc-meta">Order <strong>{order.orderNumber}</strong> <span aria-hidden="true">/</span> {date} <span aria-hidden="true">/</span> {order.price}</p>
        </div>
        <span className={`badge b-${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span>
      </header>

      {cancelled ? (
        <p className="oc-cancelled">This order was cancelled. If that is a mistake, message us with the order number.</p>
      ) : (
        <ol className="oc-steps" aria-label="Order progress">
          {STEPS.map(([id, label], i) => (
            <li key={id} className={i < rank ? "done" : i === rank ? "now" : ""} aria-current={i === rank ? "step" : undefined}>
              <span className="oc-dot" aria-hidden="true" />
              <span>{id === "paid" && free ? "Trial approved" : label}</span>
            </li>
          ))}
        </ol>
      )}

      {!cancelled && (
        <div className="oc-license">
          <p className="oc-label">License key</p>
          {order.licenseKey ? (
            <>
              <div className="key-box">
                <code>{order.licenseKey}</code>
                <CopyButton text={order.licenseKey} />
              </div>
              <p className="oc-help">Open the app, go to the Activate page, paste the key and press Activate.</p>
            </>
          ) : (
            <p className="oc-wait">
              {order.machineId
                ? "Your key appears here as soon as we issue it, usually the same day after payment is confirmed."
                : "We need the Machine ID from your computer before we can issue the key. Install the app, open its Activate page and paste the ID below."}
            </p>
          )}
        </div>
      )}

      <div className="oc-forms">
        {canSendMachine ? (
          <form className="oc-form" onSubmit={(e) => { e.preventDefault(); save("machineId", machineId); }}>
            <Field label="Machine ID" hint={msg.machineId || "Shown on the app's Activate page."}>
              <span className="inline-field">
                <input value={machineId} onChange={(e) => setMachineId(e.target.value)} placeholder="7F3A-91C2-04BD-E85A" />
                <button className="btn btn-quiet btn-small" type="submit">Save</button>
              </span>
            </Field>
          </form>
        ) : order.machineId ? (
          <p className="oc-fact"><span>Machine ID</span><code>{order.machineId}</code></p>
        ) : null}

        {canSendTrx && (
          <form className="oc-form" onSubmit={(e) => { e.preventDefault(); save("transactionId", trx); }}>
            <Field label={`${method?.label || "Payment"} transaction ID`} hint={msg.transactionId || method?.instructions}>
              <span className="inline-field">
                <input value={trx} onChange={(e) => setTrx(e.target.value)} placeholder="For example 8N7A2K9Q" />
                <button className="btn btn-quiet btn-small" type="submit">Save</button>
              </span>
            </Field>
          </form>
        )}
      </div>
    </article>
  );
}

/* ---------- add an older order ---------- */

function ClaimOrder({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [msg, setMsg] = useState("");
  async function submit(e) {
    e.preventDefault();
    setMsg("Looking for it...");
    const { ok, data } = await send("/api/account/claim", "POST", { orderNumber: number });
    if (ok) { onAdded(data.order); setMsg(""); setNumber(""); setOpen(false); }
    else setMsg(data.error || "Not found.");
  }
  return (
    <div className="claim">
      {!open ? (
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>Missing an order? Add it with its order number</button>
      ) : (
        <form onSubmit={submit} className="oc-form">
          <Field label="Order number" hint={msg || "From your confirmation, for example BP-261011-7A3F. It must be placed with this account's email."}>
            <span className="inline-field">
              <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="BP-261011-7A3F" autoFocus />
              <button className="btn btn-primary btn-small" type="submit">Add order</button>
            </span>
          </Field>
        </form>
      )}
    </div>
  );
}

/* ---------- profile ---------- */

function Profile({ customer, onSaved }) {
  const [form, setForm] = useState({ name: customer.name, phone: customer.phone, company: customer.company, country: customer.country });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function saveProfile(e) {
    e.preventDefault();
    setMsg("Saving..."); setErrors({});
    const { ok, data } = await send("/api/account/me", "PATCH", form);
    if (ok) { onSaved(data.customer); setMsg("Saved."); } else { setErrors(data.fields || {}); setMsg(data.error || "Not saved."); }
  }
  async function savePassword(e) {
    e.preventDefault();
    setPwMsg("Saving..."); setErrors({});
    const { ok, data } = await send("/api/account/password", "POST", pw);
    if (ok) { setPw({ current: "", next: "" }); setPwMsg("Password changed. Other devices are signed out."); }
    else { setErrors(data.fields || {}); setPwMsg(data.error || "Not changed."); }
  }

  return (
    <div className="profile-grid">
      <form className="order-block" onSubmit={saveProfile}>
        <h2 className="block-title">Your details</h2>
        <div className="grid-2">
          <Field label="Full name" error={errors.name}><input value={form.name} onChange={set("name")} autoComplete="name" /></Field>
          <Field label="Email" hint="Message us to change the email on your account."><input value={customer.email} readOnly /></Field>
          <Field label="WhatsApp or phone"><input value={form.phone} onChange={set("phone")} autoComplete="tel" /></Field>
          <Field label="Company or agency"><input value={form.company} onChange={set("company")} autoComplete="organization" /></Field>
          <Field label="Country"><input value={form.country} onChange={set("country")} autoComplete="country-name" /></Field>
        </div>
        <div className="btn-row block-actions">
          <button className="btn btn-primary" type="submit">Save details</button>
          <span className="field-hint" aria-live="polite">{msg}</span>
        </div>
      </form>

      <form className="order-block" onSubmit={savePassword}>
        <h2 className="block-title">Change password</h2>
        <div className="stack">
          <Field label="Current password" error={errors.current}>
            <PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </Field>
          <Field label="New password" error={errors.next} hint="At least 8 characters.">
            <PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
          </Field>
        </div>
        <div className="btn-row block-actions">
          <button className="btn btn-quiet" type="submit">Change password</button>
          <span className="field-hint" aria-live="polite">{pwMsg}</span>
        </div>
      </form>
    </div>
  );
}

/* ---------- signed in ---------- */

function Dashboard({ onSignedOut }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("orders");

  async function load() {
    setError("");
    const res = await fetch("/api/account/me", { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (res.status === 401) return onSignedOut();
    if (!res.ok) return setError(d.error || "Could not load your account.");
    setData(d);
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() {
    await fetch("/api/account/logout", { method: "POST" });
    onSignedOut();
  }

  const replaceOrder = (o) => setData((d) => ({ ...d, orders: d.orders.map((x) => (x.id === o.id ? o : x)) }));
  const addOrder = (o) => setData((d) => ({ ...d, orders: [o, ...d.orders.filter((x) => x.id !== o.id)] }));
  const first = data?.customer?.name?.split(" ")[0] || "";
  const keys = data ? data.orders.filter((o) => o.licenseKey).length : 0;

  return (
    <>
      <section className="page-hero">
        <div className="wrap page-hero-inner account-hero">
          <div>
            <h1>{data ? `Hi ${first}` : "My account"}</h1>
            <p>{data ? `${data.orders.length} ${data.orders.length === 1 ? "order" : "orders"}, ${keys} ${keys === 1 ? "license key" : "license keys"} ready. Signed in as ${data.customer.email}.` : "Loading your orders..."}</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn-ghost btn-small" href="/order">New order</Link>
            <button type="button" className="btn btn-ghost btn-small" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </section>

      <main className="wrap account-page">
        <div className="account-tabs" role="tablist" aria-label="My account">
          <button type="button" role="tab" aria-selected={tab === "orders"} className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>
            Orders and licenses
          </button>
          <button type="button" role="tab" aria-selected={tab === "profile"} className={tab === "profile" ? "on" : ""} onClick={() => setTab("profile")}>
            Profile
          </button>
        </div>

        {error && <p className="form-message">{error} <button type="button" className="link-btn" onClick={load}>Try again</button></p>}
        {!data && !error && <div className="skeleton" aria-hidden="true"><span /><span /></div>}

        {data && tab === "orders" && (
          <div className="orders">
            {data.orders.length === 0 ? (
              <div className="empty">
                <h2>No orders yet</h2>
                <p>Orders you place with {data.customer.email} appear here, with their progress and license key.</p>
                <Link className="btn btn-glow" href="/order?plan=trial">Start the 7-day free trial</Link>
              </div>
            ) : (
              data.orders.map((o) => <OrderCard key={o.id} order={o} onChange={replaceOrder} />)
            )}
            <ClaimOrder onAdded={addOrder} />
            <p className="account-help">
              Questions about an order? <a href={SITE.whatsappLink} target="_blank" rel="noopener">WhatsApp {SITE.whatsapp}</a> or{" "}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, with your order number.
            </p>
          </div>
        )}

        {data && tab === "profile" && (
          <Profile customer={data.customer} onSaved={(c) => setData((d) => ({ ...d, customer: c }))} />
        )}
      </main>
    </>
  );
}

export default function AccountApp({ signedIn, next }) {
  const router = useRouter();
  const [ok, setOk] = useState(signedIn);

  function signedInNow() {
    if (next && next !== "/account") { router.push(next); router.refresh(); return; }
    setOk(true);
    router.refresh();
  }

  if (ok) return <Dashboard onSignedOut={() => { setOk(false); router.refresh(); }} />;

  return (
    <>
      <section className="page-hero">
        <div className="wrap page-hero-inner">
          <h1>My account</h1>
          <p>Follow your orders, send your Machine ID and copy your license key, any time.</p>
        </div>
      </section>
      <main className="wrap account-page auth-page">
        <AuthCard onDone={signedInNow} />
        <aside className="auth-side">
          <h2>What you find inside</h2>
          <ul className="trust-list">
            <li><strong>Order progress.</strong> See where each order is, from placed to license sent.</li>
            <li><strong>License keys.</strong> Copy your key whenever you reinstall.</li>
            <li><strong>Machine ID and payment.</strong> Send them straight to us from the order.</li>
          </ul>
        </aside>
      </main>
    </>
  );
}
