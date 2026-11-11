/**
 * `output: "export"` refuses a dynamic route whose generateStaticParams returns [].
 * Routes that can legitimately be empty (pagination, developers, version archives,
 * download pages) return this placeholder instead; the page calls notFound() for it,
 * and scripts/prune-export.ts deletes the placeholder files from /out after the build.
 */
export const PLACEHOLDER = "__none__";

export function orPlaceholder<T extends Record<string, string>>(params: T[], keys: (keyof T)[]): T[] {
  if (params.length) return params;
  return [Object.fromEntries(keys.map((k) => [k, PLACEHOLDER])) as T];
}
