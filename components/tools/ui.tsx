"use client";

import { useRef, useState, type ReactNode } from "react";

/** Shared building blocks for tool widgets, so every tool looks and behaves the same. */

export function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-[var(--radius)] border border-border bg-bg p-4 sm:p-6">{children}</div>;
}

export function FileDrop({
  accept,
  multiple,
  onFiles,
  label,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={`flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border-2 border-dashed px-4 py-10 text-center transition-colors ${
        over ? "border-accent bg-surface" : "border-border"
      }`}
    >
      <button type="button" onClick={() => input.current?.click()} className={btnPrimary}>
        {label}
      </button>
      <p className="text-sm text-muted">{hint ?? "or drag and drop here"}</p>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] bg-accent px-5 font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-50";
export const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] border border-border px-4 font-medium hover:bg-surface disabled:opacity-50";
export const fieldClass =
  "mt-1 block w-full rounded-[var(--radius)] border border-border bg-bg px-3 py-2.5 text-base focus:border-accent";
export const labelClass = "block text-[15px] font-medium";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={btnSecondary}
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked: the text is still selectable on screen */
        }
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-[15px] text-danger">
      {children}
    </p>
  );
}
