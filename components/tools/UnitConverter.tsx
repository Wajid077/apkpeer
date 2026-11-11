"use client";

import { useState } from "react";
import { CopyButton, Panel, fieldClass, labelClass } from "./ui";

export type UnitKind = "length" | "weight" | "temperature" | "data" | "speed" | "area";

type Unit = { id: string; label: string; factor?: number };

/** Factors convert one unit to the base unit (metre, kilogram, byte, metre per second). */
const UNITS: Record<Exclude<UnitKind, "temperature">, Unit[]> = {
  length: [
    { id: "mm", label: "Millimetres (mm)", factor: 0.001 },
    { id: "cm", label: "Centimetres (cm)", factor: 0.01 },
    { id: "m", label: "Metres (m)", factor: 1 },
    { id: "km", label: "Kilometres (km)", factor: 1000 },
    { id: "in", label: "Inches (in)", factor: 0.0254 },
    { id: "ft", label: "Feet (ft)", factor: 0.3048 },
    { id: "yd", label: "Yards (yd)", factor: 0.9144 },
    { id: "mi", label: "Miles (mi)", factor: 1609.344 },
    { id: "nmi", label: "Nautical miles", factor: 1852 },
  ],
  weight: [
    { id: "mg", label: "Milligrams (mg)", factor: 1e-6 },
    { id: "g", label: "Grams (g)", factor: 0.001 },
    { id: "kg", label: "Kilograms (kg)", factor: 1 },
    { id: "t", label: "Metric tonnes (t)", factor: 1000 },
    { id: "oz", label: "Ounces (oz)", factor: 0.028349523125 },
    { id: "lb", label: "Pounds (lb)", factor: 0.45359237 },
    { id: "st", label: "Stones (st)", factor: 6.35029318 },
  ],
  data: [], // built per decimal/binary mode below
  area: [
    { id: "cm2", label: "Square centimetres (cm²)", factor: 1e-4 },
    { id: "m2", label: "Square metres (m²)", factor: 1 },
    { id: "ha", label: "Hectares (ha)", factor: 10_000 },
    { id: "km2", label: "Square kilometres (km²)", factor: 1e6 },
    { id: "in2", label: "Square inches (in²)", factor: 0.00064516 },
    { id: "ft2", label: "Square feet (ft²)", factor: 0.09290304 },
    { id: "yd2", label: "Square yards (yd²)", factor: 0.83612736 },
    { id: "ac", label: "Acres (ac)", factor: 4046.8564224 },
    { id: "mi2", label: "Square miles (mi²)", factor: 2_589_988.110336 },
  ],
  speed: [
    { id: "mps", label: "Metres per second (m/s)", factor: 1 },
    { id: "kph", label: "Kilometres per hour (km/h)", factor: 1 / 3.6 },
    { id: "mph", label: "Miles per hour (mph)", factor: 0.44704 },
    { id: "kn", label: "Knots (kn)", factor: 0.514444 },
    { id: "fps", label: "Feet per second (ft/s)", factor: 0.3048 },
  ],
};

function dataUnits(binary: boolean): Unit[] {
  const k = binary ? 1024 : 1000;
  const names = binary ? ["KiB", "MiB", "GiB", "TiB"] : ["KB", "MB", "GB", "TB"];
  const long = ["Kilo", "Mega", "Giga", "Tera"].map((p) => (binary ? `${p.slice(0, 2)}bibytes` : `${p}bytes`));
  return [
    { id: "bit", label: "Bits (b)", factor: 1 / 8 },
    { id: "B", label: "Bytes (B)", factor: 1 },
    ...names.map((n, i) => ({ id: n, label: `${long[i]} (${n})`, factor: k ** (i + 1) })),
  ];
}

const TEMP: Unit[] = [
  { id: "C", label: "Celsius (°C)" },
  { id: "F", label: "Fahrenheit (°F)" },
  { id: "K", label: "Kelvin (K)" },
];
const toC = (v: number, u: string) => (u === "C" ? v : u === "F" ? ((v - 32) * 5) / 9 : v - 273.15);
const fromC = (c: number, u: string) => (u === "C" ? c : u === "F" ? (c * 9) / 5 + 32 : c + 273.15);

/** Up to 10 significant digits, without long float noise like 0.30000000000000004. */
const show = (n: number) => (Number.isFinite(n) ? Number(n.toPrecision(10)).toLocaleString(undefined, { maximumFractionDigits: 10 }) : "—");

const DEFAULT_FROM: Record<UnitKind, string> = { length: "m", weight: "kg", temperature: "C", data: "MB", speed: "kph", area: "ft2" };

export default function UnitConverter({ kind }: { kind: UnitKind }) {
  const [value, setValue] = useState(kind === "temperature" ? "25" : "1");
  const [from, setFrom] = useState(DEFAULT_FROM[kind]);
  const [binary, setBinary] = useState(false);

  const units = kind === "temperature" ? TEMP : kind === "data" ? dataUnits(binary) : UNITS[kind];
  const v = value.trim() === "" ? NaN : Number(value);
  // Keep the selected unit valid when switching KB ↔ KiB.
  const fromId = units.some((u) => u.id === from) ? from : units[units.length > 3 ? 3 : 0].id;

  const convert = (to: Unit) => {
    if (kind === "temperature") return fromC(toC(v, fromId), to.id);
    const f = units.find((u) => u.id === fromId)!.factor!;
    return (v * f) / to.factor!;
  };

  return (
    <Panel>
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Value
            <input type="number" inputMode="decimal" step="any" value={value} onChange={(e) => setValue(e.target.value)} className={`${fieldClass} text-lg`} />
          </label>
          <label className={labelClass}>
            From
            <select value={fromId} onChange={(e) => setFrom(e.target.value)} className={fieldClass}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {kind === "data" && (
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={!binary} onChange={() => setBinary(false)} />Decimal (1 MB = 1000 KB, used by storage makers)</label>
            <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" checked={binary} onChange={() => setBinary(true)} />Binary (1 MiB = 1024 KiB, used by Windows)</label>
          </div>
        )}
        <dl aria-live="polite" className="divide-y divide-border rounded-[var(--radius)] border border-border">
          {units.map((u) => {
            const r = show(convert(u));
            return (
              <div key={u.id} className={`flex flex-wrap items-center gap-3 p-3 ${u.id === fromId ? "bg-surface" : ""}`}>
                <dt className="w-56 shrink-0 text-[15px] text-muted">{u.label}</dt>
                <dd className="min-w-0 flex-1 break-all font-mono text-lg font-semibold">{r}</dd>
                <CopyButton text={r === "—" ? "" : r} />
              </div>
            );
          })}
        </dl>
      </div>
    </Panel>
  );
}
