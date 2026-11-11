"use client";

import { useEffect, useState } from "react";
import { ErrorNote, Panel, fieldClass, labelClass } from "./ui";

export type CalcKind = "age" | "bmi" | "percentage" | "discount" | "tip" | "loan" | "compound" | "datediff" | "salestax";

const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: d }) : "—");
const money = (n: number) => (Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—");
const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function Field({ label, value, onChange, type = "number", suffix, step = "any" }: { label: string; value: string; onChange: (v: string) => void; type?: string; suffix?: string; step?: string }) {
  return (
    <label className={labelClass}>
      {label}
      <span className="relative mt-1 block">
        <input type={type} inputMode={type === "number" ? "decimal" : undefined} step={step} value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldClass} mt-0 ${suffix ? "pr-14" : ""}`} />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">{suffix}</span>}
      </span>
    </label>
  );
}

function Results({ items, big }: { items: [string, string][]; big?: [string, string] }) {
  return (
    <div aria-live="polite" className="space-y-3">
      {big && (
        <div className="rounded-[var(--radius)] border border-accent bg-surface p-4">
          <p className="text-sm text-muted">{big[0]}</p>
          <p className="text-3xl font-bold">{big[1]}</p>
        </div>
      )}
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-[var(--radius)] border border-border p-3">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="text-lg font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const parseDate = (s: string) => (s ? new Date(`${s}T00:00:00`) : null);
/** Calendar difference in whole years, months and days. */
function ymd(a: Date, b: Date) {
  let y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  return { y, m, d };
}
const DAY = 86_400_000;
const daysBetween = (a: Date, b: Date) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY);

// ---------- age ----------
function Age() {
  const [dob, setDob] = useState("2000-01-15");
  const [asOf, setAsOf] = useState("");
  useEffect(() => setAsOf(todayIso()), []);
  const a = parseDate(dob), b = parseDate(asOf);
  if (!a || !b) return <Field label="Date of birth" type="date" value={dob} onChange={setDob} />;
  const bad = a > b;
  const { y, m, d } = ymd(a, b);
  const total = daysBetween(a, b);
  let next = new Date(b.getFullYear(), a.getMonth(), a.getDate());
  if (next <= b) next = new Date(b.getFullYear() + 1, a.getMonth(), a.getDate());
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" type="date" value={dob} onChange={setDob} />
        <Field label="Age on this date" type="date" value={asOf} onChange={setAsOf} />
      </div>
      {bad ? <ErrorNote>The date of birth is after the second date.</ErrorNote> : (
        <Results
          big={["Age", `${y} years, ${m} months, ${d} days`]}
          items={[
            ["Total months", fmt(y * 12 + m, 0)],
            ["Total weeks", fmt(Math.floor(total / 7), 0)],
            ["Total days", fmt(total, 0)],
            ["Born on a", a.toLocaleDateString(undefined, { weekday: "long" })],
            ["Next birthday in", `${daysBetween(b, next)} days`],
            ["Next birthday is a", next.toLocaleDateString(undefined, { weekday: "long" })],
          ]}
        />
      )}
    </div>
  );
}

// ---------- BMI ----------
function Bmi() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [cm, setCm] = useState("170"), [kg, setKg] = useState("68");
  const [ft, setFt] = useState("5"), [inch, setInch] = useState("7"), [lb, setLb] = useState("150");
  const hM = unit === "metric" ? num(cm) / 100 : (num(ft) * 12 + (num(inch) || 0)) * 0.0254;
  const wKg = unit === "metric" ? num(kg) : num(lb) * 0.45359237;
  const bmi = wKg / (hM * hM);
  const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy weight" : bmi < 30 ? "Overweight" : "Obesity";
  const lo = 18.5 * hM * hM, hi = 24.9 * hM * hM;
  const show = (k: number) => (unit === "metric" ? `${fmt(k, 1)} kg` : `${fmt(k / 0.45359237, 0)} lb`);
  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        {(["metric", "imperial"] as const).map((u) => (
          <label key={u} className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={unit === u} onChange={() => setUnit(u)} />{u === "metric" ? "Metric (cm, kg)" : "Imperial (ft, in, lb)"}</label>
        ))}
      </div>
      {unit === "metric" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Height" value={cm} onChange={setCm} suffix="cm" />
          <Field label="Weight" value={kg} onChange={setKg} suffix="kg" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Height" value={ft} onChange={setFt} suffix="ft" />
          <Field label={" "} value={inch} onChange={setInch} suffix="in" />
          <Field label="Weight" value={lb} onChange={setLb} suffix="lb" />
        </div>
      )}
      {Number.isFinite(bmi) && bmi > 0 && bmi < 200 && (
        <Results big={["Your BMI", `${fmt(bmi, 1)} · ${cat}`]} items={[["Healthy weight for your height", `${show(lo)} – ${show(hi)}`], ["BMI ranges (adults)", "Under 18.5 · 18.5–24.9 · 25–29.9 · 30+"]]} />
      )}
      <p className="text-sm text-muted">BMI is a screening measure for adults, not a diagnosis. It doesn&apos;t account for muscle, age or ethnicity, and different ranges apply to children.</p>
    </div>
  );
}

// ---------- percentage ----------
function Percentage() {
  const [a, setA] = useState("15"), [b, setB] = useState("200");
  const [c, setC] = useState("30"), [d, setD] = useState("120");
  const [e, setE] = useState("80"), [f, setF] = useState("100");
  const change = ((num(f) - num(e)) / Math.abs(num(e))) * 100;
  const box = "rounded-[var(--radius)] border border-border p-4 space-y-3";
  return (
    <div className="space-y-4">
      <div className={box}>
        <p className="font-semibold">What is X% of Y?</p>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Percent" value={a} onChange={setA} suffix="%" /><Field label="Of" value={b} onChange={setB} /></div>
        <p aria-live="polite" className="text-lg">= <strong>{fmt((num(a) / 100) * num(b), 4)}</strong></p>
      </div>
      <div className={box}>
        <p className="font-semibold">X is what percent of Y?</p>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Value" value={c} onChange={setC} /><Field label="Of total" value={d} onChange={setD} /></div>
        <p aria-live="polite" className="text-lg">= <strong>{fmt((num(c) / num(d)) * 100, 4)}%</strong></p>
      </div>
      <div className={box}>
        <p className="font-semibold">Percentage change from X to Y</p>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="From" value={e} onChange={setE} /><Field label="To" value={f} onChange={setF} /></div>
        <p aria-live="polite" className="text-lg">= <strong>{Number.isFinite(change) ? `${change > 0 ? "+" : ""}${fmt(change, 4)}%` : "—"}</strong> {Number.isFinite(change) && (change >= 0 ? "increase" : "decrease")}</p>
      </div>
    </div>
  );
}

// ---------- discount ----------
function Discount() {
  const [price, setPrice] = useState("2500"), [pct, setPct] = useState("20"), [extra, setExtra] = useState("");
  const p = num(price), d1 = num(pct) || 0, d2 = num(extra) || 0;
  const final = p * (1 - d1 / 100) * (1 - d2 / 100);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Original price" value={price} onChange={setPrice} />
        <Field label="Discount" value={pct} onChange={setPct} suffix="%" />
        <Field label="Extra discount (optional)" value={extra} onChange={setExtra} suffix="%" />
      </div>
      {Number.isFinite(p) && (
        <Results big={["Final price", money(final)]} items={[["You save", money(p - final)], ["Total discount", `${fmt((1 - final / p) * 100, 2)}%`]]} />
      )}
      {d2 > 0 && <p className="text-sm text-muted">Stacked discounts apply one after the other, so {d1}% + {d2}% is less than {d1 + d2}% off.</p>}
    </div>
  );
}

// ---------- tip ----------
function Tip() {
  const [bill, setBill] = useState("80"), [pct, setPct] = useState("15"), [people, setPeople] = useState("2");
  const b = num(bill), t = (b * (num(pct) || 0)) / 100, n = Math.max(1, Math.floor(num(people) || 1));
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Bill amount" value={bill} onChange={setBill} />
        <Field label="Tip" value={pct} onChange={setPct} suffix="%" />
        <Field label="Split between" value={people} onChange={setPeople} suffix="people" step="1" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[10, 15, 18, 20, 25].map((p) => (
          <button key={p} type="button" onClick={() => setPct(String(p))} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 hover:bg-surface">{p}%</button>
        ))}
      </div>
      {Number.isFinite(b) && <Results big={["Each person pays", money((b + t) / n)]} items={[["Tip", money(t)], ["Total with tip", money(b + t)], ["Tip per person", money(t / n)]]} />}
    </div>
  );
}

// ---------- loan EMI ----------
function Loan() {
  const [amount, setAmount] = useState("500000"), [rate, setRate] = useState("12"), [term, setTerm] = useState("5"), [unit, setUnit] = useState<"years" | "months">("years");
  const P = num(amount), r = num(rate) / 12 / 100, n = Math.round(num(term) * (unit === "years" ? 12 : 1));
  const emi = r === 0 ? P / n : (P * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  const total = emi * n;
  const rows: [number, number, number, number][] = [];
  if (Number.isFinite(emi) && n > 0 && n <= 600) {
    let bal = P;
    for (let y = 1; y <= Math.ceil(n / 12); y++) {
      let pi = 0, ii = 0;
      for (let m = 0; m < 12 && (y - 1) * 12 + m < n; m++) { const i = bal * r; ii += i; pi += emi - i; bal -= emi - i; }
      rows.push([y, pi, ii, Math.max(0, bal)]);
    }
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loan amount" value={amount} onChange={setAmount} />
        <Field label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" />
        <label className={labelClass}>
          Term
          <span className="mt-1 flex gap-2">
            <input type="number" value={term} onChange={(e) => setTerm(e.target.value)} className={`${fieldClass} mt-0`} />
            <select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className={`${fieldClass} mt-0 w-32`}><option value="years">years</option><option value="months">months</option></select>
          </span>
        </label>
      </div>
      {Number.isFinite(emi) && n > 0 && (
        <>
          <Results big={["Monthly payment (EMI)", money(emi)]} items={[["Total interest", money(total - P)], ["Total payment", money(total)]]} />
          {rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead><tr className="border-b border-border"><th className="p-2">Year</th><th className="p-2">Principal paid</th><th className="p-2">Interest paid</th><th className="p-2">Balance</th></tr></thead>
                <tbody>{rows.map(([y, p, i, b]) => <tr key={y} className="border-b border-border"><td className="p-2">{y}</td><td className="p-2">{money(p)}</td><td className="p-2">{money(i)}</td><td className="p-2">{money(b)}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------- compound interest ----------
function Compound() {
  const [p, setP] = useState("10000"), [rate, setRate] = useState("8"), [years, setYears] = useState("10"), [freq, setFreq] = useState("12"), [add, setAdd] = useState("100");
  const P = num(p) || 0, r = num(rate) / 100, Y = Math.min(100, Math.floor(num(years) || 0)), n = Number(freq), m = num(add) || 0;
  const rows: [number, number, number][] = [];
  let bal = P, contributed = P;
  for (let y = 1; y <= Y; y++) {
    for (let mo = 1; mo <= 12; mo++) {
      bal += m;
      contributed += m;
      // Apply interest at the end of each compounding period.
      if ((mo * n) % 12 === 0 || n === 365) bal *= n === 365 ? (1 + r / 365) ** (365 / 12) : 1 + r / n;
    }
    rows.push([y, contributed, bal]);
  }
  const last = rows[rows.length - 1];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Starting amount" value={p} onChange={setP} />
        <Field label="Interest rate (yearly)" value={rate} onChange={setRate} suffix="%" />
        <Field label="Years" value={years} onChange={setYears} step="1" />
        <label className={labelClass}>
          Compounded
          <select value={freq} onChange={(e) => setFreq(e.target.value)} className={fieldClass}>
            <option value="1">Yearly</option><option value="4">Quarterly</option><option value="12">Monthly</option><option value="365">Daily</option>
          </select>
        </label>
        <Field label="Monthly contribution" value={add} onChange={setAdd} />
      </div>
      {last && Number.isFinite(last[2]) && (
        <>
          <Results big={[`Balance after ${Y} years`, money(last[2])]} items={[["Total contributed", money(last[1])], ["Interest earned", money(last[2] - last[1])]]} />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead><tr className="border-b border-border"><th className="p-2">Year</th><th className="p-2">Contributed</th><th className="p-2">Interest</th><th className="p-2">Balance</th></tr></thead>
              <tbody>{rows.map(([y, c, b]) => <tr key={y} className="border-b border-border"><td className="p-2">{y}</td><td className="p-2">{money(c)}</td><td className="p-2">{money(b - c)}</td><td className="p-2">{money(b)}</td></tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- date difference ----------
function DateDiff() {
  const [from, setFrom] = useState(""), [to, setTo] = useState("2026-12-31"), [incl, setIncl] = useState(false);
  useEffect(() => setFrom(todayIso()), []);
  const a = parseDate(from), b = parseDate(to);
  if (!a || !b) return <Field label="Start date" type="date" value={from} onChange={setFrom} />;
  const [s, e] = a <= b ? [a, b] : [b, a];
  const days = daysBetween(s, e) + (incl ? 1 : 0);
  const { y, m, d } = ymd(s, e);
  // Count Mon–Fri by calendar date (not 24 h steps, which drift across daylight-saving changes).
  let work = 0;
  const span = daysBetween(s, e) + (incl ? 1 : 0);
  for (let i = 0; i < Math.min(span, 100_000); i++) {
    const w = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i).getDay();
    if (w !== 0 && w !== 6) work++;
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" type="date" value={from} onChange={setFrom} />
        <Field label="End date" type="date" value={to} onChange={setTo} />
      </div>
      <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={incl} onChange={(ev) => setIncl(ev.target.checked)} />Include the end date</label>
      <Results
        big={["Difference", `${fmt(days, 0)} days`]}
        items={[
          ["Weeks and days", `${Math.floor(days / 7)} weeks, ${days % 7} days`],
          ["Years, months, days", `${y} y, ${m} m, ${d + (incl ? 1 : 0)} d`],
          ["Weekdays (Mon–Fri)", fmt(work, 0)],
          ["Hours", fmt(days * 24, 0)],
        ]}
      />
    </div>
  );
}

// ---------- sales tax / GST / VAT ----------
function SalesTax() {
  const [amount, setAmount] = useState("1000"), [rate, setRate] = useState("18"), [mode, setMode] = useState<"add" | "remove">("add");
  const A = num(amount), R = (num(rate) || 0) / 100;
  const net = mode === "add" ? A : A / (1 + R);
  const tax = net * R;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={mode === "add"} onChange={() => setMode("add")} />Add tax to a price</label>
        <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={mode === "remove"} onChange={() => setMode("remove")} />Remove tax from a price</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={mode === "add" ? "Price before tax" : "Price including tax"} value={amount} onChange={setAmount} />
        <Field label="Tax rate (GST, VAT or sales tax)" value={rate} onChange={setRate} suffix="%" />
      </div>
      {Number.isFinite(A) && (
        <Results big={[mode === "add" ? "Price with tax" : "Price before tax", money(mode === "add" ? net + tax : net)]} items={[["Tax amount", money(tax)], ["Net price", money(net)], ["Gross price", money(net + tax)]]} />
      )}
    </div>
  );
}

const MAP: Record<CalcKind, () => React.ReactElement> = {
  age: Age, bmi: Bmi, percentage: Percentage, discount: Discount, tip: Tip, loan: Loan, compound: Compound, datediff: DateDiff, salestax: SalesTax,
};

export default function Calculators({ kind }: { kind: CalcKind }) {
  const C = MAP[kind];
  return (
    <Panel>
      <C />
    </Panel>
  );
}
