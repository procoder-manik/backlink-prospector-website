"use client";

export default function CurrencySwitch({ value, onChange, small = false }) {
  return (
    <div className={`currency ${small ? "small" : ""} ${value === "BDT" ? "is-bdt" : ""}`} role="radiogroup" aria-label="Currency">
      <span className="currency-pill" aria-hidden="true" />
      {["USD", "BDT"].map((c) => (
        <button key={c} type="button" role="radio" aria-checked={value === c}
          className={value === c ? "on" : ""} onClick={() => onChange(c)}>
          {c === "USD" ? "US dollars" : "Taka"}
        </button>
      ))}
    </div>
  );
}
