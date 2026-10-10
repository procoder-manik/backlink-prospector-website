"use client";

import { useEffect, useMemo, useState } from "react";

const STATUSES = [
  ["new", "New"], ["contacted", "Contacted"], ["paid", "Paid"], ["licensed", "License sent"], ["cancelled", "Cancelled"],
];

function Login({ onDone }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) onDone(); else setErr(data.error || "Sign-in failed.");
  }
  return (
    <form className="admin-login" onSubmit={submit}>
      <h1>Orders</h1>
      <label className="field"><span className="field-label">Admin password</span>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required /></label>
      {err && <p className="field-error">{err}</p>}
      <button className="btn btn-primary" type="submit">Sign in</button>
    </form>
  );
}

function OrderRow({ order, onSaved, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ status: order.status, licenseKey: order.licenseKey || "", adminNotes: order.adminNotes || "", machineId: order.machineId || "" });
  const [msg, setMsg] = useState("");
  const [reset, setReset] = useState("");

  async function save() {
    setMsg("Saving...");
    const res = await fetch(`/api/admin/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { onSaved(data.order); setMsg("Saved"); } else setMsg(data.error || "Not saved");
  }
  async function resetPassword() {
    if (!confirm(`Give ${order.email} a new temporary password? Their old password stops working.`)) return;
    const res = await fetch("/api/admin/customers/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: order.email }) });
    const data = await res.json().catch(() => ({}));
    setReset(res.ok ? data.password : "");
    if (!res.ok) setMsg(data.error || "Not reset");
  }
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const resetBody = encodeURIComponent(
    `Hi ${order.name},\n\nHere is a temporary password for your Backlink Prospector account:\n\n${reset}\n\nSign in at ${origin}/account with ${order.email}, then change it under Profile.\n\nThanks!`);
  async function remove() {
    if (!confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(order.id);
  }
  const mailBody = encodeURIComponent(
    `Hi ${order.name},\n\nThanks for your order ${order.orderNumber} (${order.planName}).\n\nYour license key:\n\n${draft.licenseKey}\n\nOpen the app, go to the Activate page, paste the key and press Activate.\n\nYou can also copy this key any time from My account: ${typeof window !== "undefined" ? window.location.origin : ""}/account\n\nThanks!`);

  return (
    <>
      <tr className={`admin-row status-${order.status}`} onClick={() => setOpen(!open)}>
        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
        <td><strong>{order.orderNumber}</strong></td>
        <td>{order.name}<br /><small>{order.email}</small></td>
        <td>{order.planName}<br /><small>{order.price}</small></td>
        <td>{order.paymentMethod}{order.transactionId ? <><br /><small>TrxID {order.transactionId}</small></> : null}</td>
        <td><span className={`badge b-${order.status}`}>{STATUSES.find((s) => s[0] === order.status)?.[1] || order.status}</span></td>
      </tr>
      {open && (
        <tr className="admin-detail"><td colSpan={6}>
          <div className="admin-grid">
            <div>
              <p><b>Company</b> {order.company || "None"}</p>
              <p><b>Country</b> {order.country || "None"}</p>
              <p><b>Phone</b> {order.phone || "None"}</p>
              <p><b>Message</b> {order.notes || "None"}</p>
              <p><b>Account</b> {order.customerId ? "Linked to the customer's account" : "Placed before accounts. The customer can add it in My account with the order number."}</p>
              {order.customerUpdatedAt && <p><b>Customer update</b> {new Date(order.customerUpdatedAt).toLocaleString()}</p>}
              <div className="btn-row">
                <button className="btn btn-quiet btn-small" type="button" onClick={resetPassword}>Reset account password</button>
              </div>
              {reset && (
                <p className="pay-note">
                  Temporary password: <code>{reset}</code>{" "}
                  <a href={`mailto:${order.email}?subject=${encodeURIComponent("Your Backlink Prospector password")}&body=${resetBody}`}>Email it to the customer</a>
                </p>
              )}
            </div>
            <div className="stack">
              <label className="field"><span className="field-label">Status</span>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select></label>
              <label className="field"><span className="field-label">Machine ID</span>
                <input value={draft.machineId} onChange={(e) => setDraft({ ...draft, machineId: e.target.value })} /></label>
              <label className="field"><span className="field-label">License key</span>
                <textarea rows={3} value={draft.licenseKey} onChange={(e) => setDraft({ ...draft, licenseKey: e.target.value })} placeholder="Paste the BP1-... key from license-admin" /></label>
              <label className="field"><span className="field-label">Private notes</span>
                <textarea rows={2} value={draft.adminNotes} onChange={(e) => setDraft({ ...draft, adminNotes: e.target.value })} /></label>
              <div className="btn-row">
                <button className="btn btn-primary btn-small" type="button" onClick={save}>Save changes</button>
                {draft.licenseKey && <a className="btn btn-quiet btn-small" href={`mailto:${order.email}?subject=${encodeURIComponent("Your Backlink Prospector license")}&body=${mailBody}`}>Email the key</a>}
                <button className="btn btn-quiet btn-small danger" type="button" onClick={remove}>Delete</button>
                <span className="field-hint">{msg}</span>
              </div>
            </div>
          </div>
        </td></tr>
      )}
    </>
  );
}

function Dashboard({ onSignOut }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    setError("");
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return onSignOut();
    if (!res.ok) return setError(data.error || "Could not load orders.");
    setOrders(data.orders);
  }
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => (orders || []).filter((o) => filter === "all" || o.status === filter), [orders, filter]);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map(([s]) => [s, (orders || []).filter((o) => o.status === s).length])), [orders]);

  async function signOut() { await fetch("/api/admin/logout", { method: "POST" }); onSignOut(); }

  return (
    <div className="admin">
      <div className="admin-head">
        <h1>Orders</h1>
        <div className="btn-row">
          <button className="btn btn-quiet btn-small" onClick={load} type="button">Refresh</button>
          <button className="btn btn-quiet btn-small" onClick={signOut} type="button">Sign out</button>
        </div>
      </div>
      <div className="admin-filters">
        <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All {orders ? orders.length : ""}</button>
        {STATUSES.map(([s, l]) => (
          <button key={s} type="button" className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>{l} {counts[s] || 0}</button>
        ))}
      </div>
      {error && <p className="form-message">{error}</p>}
      {!orders && !error && <p>Loading orders...</p>}
      {orders && shown.length === 0 && <p>No orders here yet. New orders from the website appear at the top.</p>}
      {shown.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Order</th><th>Customer</th><th>Plan</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map((o) => (
                <OrderRow key={o.id} order={o}
                  onSaved={(u) => setOrders((list) => list.map((x) => (x.id === u.id ? u : x)))}
                  onDeleted={(id) => setOrders((list) => list.filter((x) => x.id !== id))} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminApp({ signedIn }) {
  const [ok, setOk] = useState(signedIn);
  return ok ? <Dashboard onSignOut={() => setOk(false)} /> : <Login onDone={() => setOk(true)} />;
}
