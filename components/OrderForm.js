"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_PLANS, findPlan, formatPrice } from "@/lib/plans";
import { PAYMENT_METHODS } from "@/lib/site";
import CurrencySwitch from "@/components/CurrencySwitch";
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

export default function OrderForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [plan, setPlan] = useState(findPlan(params.get("plan"))?.id || "yearly");
  const [currency, setCurrency] = useState(params.get("currency") === "BDT" ? "BDT" : "USD");
  const [payment, setPayment] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", country: "", phone: "", machineId: "", transactionId: "", notes: "", website: "" });
  const [account, setAccount] = useState(undefined); // undefined while checking, null when signed out
  const [existing, setExisting] = useState(false); // the email already has an account
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const selected = useMemo(() => findPlan(plan), [plan]);
  const paid = selected && selected.usd > 0;
  const method = PAYMENT_METHODS.find((m) => m.id === payment);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const nextUrl = `/order?plan=${plan}&currency=${currency}`;

  // A signed-in customer orders under their account, so their details are filled in for them.
  useEffect(() => {
    let live = true;
    fetch("/api/account/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { customer: null }))
      .then((d) => {
        if (!live) return;
        setAccount(d.customer || null);
        if (d.customer) {
          const c = d.customer;
          setForm((f) => ({ ...f, name: f.name || c.name, email: c.email, phone: f.phone || c.phone, company: f.company || c.company, country: f.country || c.country }));
        }
      })
      .catch(() => live && setAccount(null));
    return () => { live = false; };
  }, []);

  async function signOut() {
    await fetch("/api/account/logout", { method: "POST" });
    setAccount(null);
    setForm((f) => ({ ...f, email: "", password: "" }));
  }

  async function submit(e) {
    e.preventDefault();
    setSending(true); setMessage(""); setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password: account ? "" : form.password, plan, currency, paymentMethod: paid ? payment : "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields || {});
        if (data.accountExists) setExisting(true);
        setMessage(data.error || "The order was not sent. Try again.");
        return;
      }
      router.push(`/order/success?n=${encodeURIComponent(data.orderNumber)}&plan=${plan}${data.createdAccount ? "&new=1" : ""}`);
      router.refresh();
    } catch {
      setMessage("No connection. Check your internet and try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="order" onSubmit={submit} noValidate>
      <fieldset className="order-block">
        <legend>Plan</legend>
        <CurrencySwitch small value={currency} onChange={setCurrency} />
        <div className="plan-picker">
          {ALL_PLANS.map((p) => (
            <label key={p.id} className={`pick ${plan === p.id ? "on" : ""}`}>
              <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} />
              <span className="pick-name">{p.name}{p.popular && <span className="pick-tag">Most chosen</span>}</span>
              <span className="pick-price">{formatPrice(p, currency)} <small>{p.period}</small></span>
            </label>
          ))}
        </div>
        {errors.plan && <p className="field-error">{errors.plan}</p>}
      </fieldset>

      <fieldset className="order-block">
        <legend>Your details</legend>
        {account ? (
          <p className="account-note">
            Signed in as <strong>{account.email}</strong>. This order is added to your account.{" "}
            <button type="button" className="link-btn" onClick={signOut}>Not you? Sign out</button>
          </p>
        ) : account === null ? (
          <p className="account-note">
            We create your account from these details, so you can follow the order and copy your license key in My account.{" "}
            Already have one? <Link href={`/account?next=${encodeURIComponent(nextUrl)}`}>Sign in</Link>
          </p>
        ) : null}
        <div className="grid-2">
          <Field label="Full name" error={errors.name}>
            <input value={form.name} onChange={set("name")} autoComplete="name" required />
          </Field>
          <Field label="Email" error={errors.email} hint={account ? "Your account email." : "Your license key is sent here. You sign in with it."}>
            <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required readOnly={!!account} />
          </Field>
          {account === null && (
            <Field label={existing ? "Your account password" : "Create a password"} error={errors.password}
              hint={existing ? "This email already has an account. Enter its password to add this order to it." : "At least 8 characters. Used to sign in to My account."}>
              <PasswordInput value={form.password} onChange={set("password")} autoComplete={existing ? "current-password" : "new-password"} required />
            </Field>
          )}
          <Field label="Company or agency (optional)">
            <input value={form.company} onChange={set("company")} autoComplete="organization" />
          </Field>
          <Field label="Country">
            <input value={form.country} onChange={set("country")} autoComplete="country-name" />
          </Field>
          <Field label="WhatsApp or phone (optional)">
            <input value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </Field>
          <Field label="Machine ID (optional)" error={errors.machineId}
            hint="Shown on the app's Activate page. You can send it later.">
            <input value={form.machineId} onChange={set("machineId")} placeholder="7F3A-91C2-04BD-E85A" />
          </Field>
        </div>
        <input className="hp" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} aria-hidden="true" />
      </fieldset>

      {paid && (
        <fieldset className="order-block">
          <legend>Payment</legend>
          <div className="pay-picker">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.id} className={`pick ${payment === m.id ? "on" : ""}`}>
                <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} />
                <span className="pick-name">{m.label}</span>
                <small>{m.region}</small>
              </label>
            ))}
          </div>
          {errors.paymentMethod && <p className="field-error">{errors.paymentMethod}</p>}
          {method && <p className="pay-note">{method.instructions}</p>}
          {method && ["bkash", "nagad", "bank"].includes(method.id) && (
            <Field label="Transaction ID (if you have already paid)">
              <input value={form.transactionId} onChange={set("transactionId")} />
            </Field>
          )}
        </fieldset>
      )}

      <fieldset className="order-block">
        <legend>Anything we should know?</legend>
        <Field label="Message (optional)" hint="Number of computers, questions, or a good time to call.">
          <textarea rows={4} value={form.notes} onChange={set("notes")} />
        </Field>
      </fieldset>

      <div className="order-submit">
        {message && <p className="form-message" role="alert">{message}</p>}
        <button className="btn btn-glow" type="submit" disabled={sending}>
          {sending ? "Placing order..." : selected?.usd === 0 ? "Start my free trial" : `Place order for ${selected ? formatPrice(selected, currency) : ""}`}
        </button>
        <p className="field-hint">No card details are collected here. We confirm every order personally.</p>
      </div>
    </form>
  );
}
