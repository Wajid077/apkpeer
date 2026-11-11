import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { appExists } from "./content";
import { SITE } from "./site";
import ContactForm from "@/components/ContactForm";

export type Heading = { id: string; text: string };

function plainText(md: string): string {
  return md
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_]/g, "")
    .trim();
}

/** H2s for the TOC. Slugs every heading in order so ids match rehype-slug. */
export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let inFence = false;
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!m) continue;
    const text = plainText(m[2]);
    const id = slugger.slug(text);
    if (m[1].length === 2) out.push({ id, text });
  }
  return out;
}

/** Links to an APKPeer app page, or plain text until that page is published. */
function AppLink({ slug, children }: { slug: string; children: ReactNode }) {
  if (!appExists(slug)) return <>{children}</>;
  return <Link href={`/app/${slug}`}>{children}</Link>;
}

function Anchor({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href}>{children}</Link>;
  }
  return (
    <a href={href} rel="noopener" {...rest}>
      {children}
    </a>
  );
}

/**
 * "the contact form" (+ " or by email at x" once SITE.contactEmail is set).
 * Reads naturally after "through" / "via": "contact us through <Reach />".
 */
function Reach() {
  return (
    <>
      the <Link href="/contact#contact-form">contact form</Link>
      {SITE.contactEmail && (
        <>
          {" "}or by email at <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </>
      )}
    </>
  );
}

/** A "Prefer email?" line, only when an address is configured. */
function EmailNote() {
  if (!SITE.contactEmail) return null;
  return (
    <p>
      Prefer email? Write to <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
    </p>
  );
}

function SiteContactForm() {
  if (!SITE.contactFormKey) return null;
  return <ContactForm accessKey={SITE.contactFormKey} siteName={SITE.name} />;
}

const Operator = () => <>{SITE.operator}</>;

const components = { a: Anchor, AppLink, Reach, EmailNote, ContactForm: SiteContactForm, Operator };

export async function renderMdx(source: string) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  });
  return <Content components={components} />;
}
