"use client";

import { MoonIcon, SunIcon } from "./icons";

/** Runs before paint (inlined in <head>) so the stored theme never flashes. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.getAttribute("data-theme") ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-fg"
    >
      {/* Both icons render; CSS shows the right one, so there is no hydration mismatch. */}
      <SunIcon className="hidden [:root[data-theme=dark]_&]:block" />
      <MoonIcon className="block [:root[data-theme=dark]_&]:hidden" />
    </button>
  );
}
