"use client";

import { useState, type FormEvent } from "react";

const TOPICS = [
  "Correction or outdated version",
  "App request",
  "Copyright / DMCA notice",
  "Privacy or data request",
  "Something else",
];

type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };

/** Posts to Web3Forms, which emails the submission to the site owner. No cookies, no page reload. */
export default function ContactForm({ accessKey, siteName }: { accessKey: string; siteName: string }) {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data.botcheck) return; // honeypot filled → silently drop
    setStatus({ state: "sending" });
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: `${siteName} contact form`,
          subject: `[${siteName}] ${data.topic}`,
          name: data.name,
          email: data.email,
          topic: data.topic,
          page_url: data.page_url || undefined,
          message: data.message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        form.reset();
        setStatus({ state: "sent" });
      } else {
        setStatus({ state: "error", message: json.message });
      }
    } catch {
      setStatus({ state: "error" });
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-[var(--radius)] border border-border bg-surface p-6">
        <p className="font-semibold">Thanks, your message has been sent.</p>
        <p className="mt-1 text-muted">We&apos;ll reply to the email address you gave us.</p>
      </div>
    );
  }

  const field = "mt-1 block w-full rounded-[var(--radius)] border border-border bg-bg px-3 py-2.5 text-base focus:border-accent";
  const label = "block text-[15px] font-medium";

  return (
    <form id="contact-form" onSubmit={onSubmit} className="scroll-mt-[var(--header-offset)] space-y-5 rounded-[var(--radius)] border border-border p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Your name
          <input name="name" required autoComplete="name" maxLength={100} className={field} />
        </label>
        <label className={label}>
          Your email
          <input name="email" type="email" required autoComplete="email" maxLength={200} className={field} />
        </label>
      </div>
      <label className={label}>
        What&apos;s it about?
        <select name="topic" required defaultValue={TOPICS[0]} className={field}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        Page URL <span className="font-normal text-muted">(optional)</span>
        <input name="page_url" type="url" placeholder="https://apkpeer.com/app/…" maxLength={300} className={field} />
      </label>
      <label className={label}>
        Message
        <textarea name="message" required rows={6} minLength={10} maxLength={5000} className={field} />
      </label>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {status.state === "error" && (
        <p role="alert" className="text-[15px] text-danger">
          Sorry, the message couldn&apos;t be sent{status.message ? ` (${status.message})` : ""}. Please try again in a minute.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="inline-flex min-h-11 items-center rounded-[var(--radius)] bg-accent px-5 font-semibold text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
        >
          {status.state === "sending" ? "Sending…" : "Send message"}
        </button>
        <p className="text-sm text-muted">
          Sent securely via Web3Forms. See our <a href="/privacy-policy" className="underline underline-offset-2">privacy policy</a>.
        </p>
      </div>
    </form>
  );
}
