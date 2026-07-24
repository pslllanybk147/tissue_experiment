import type { KnowledgeSource } from "./knowledge-sources";
import { normalizeDoi } from "./source-discovery";

export function canonicalSourceUrl(value: string): string {
  try { const url = new URL(value.trim()); url.hash = ""; [...url.searchParams.keys()].filter(key => key.toLowerCase().startsWith("utm_")).forEach(key => url.searchParams.delete(key)); return url.toString().replace(/\/$/, "").toLowerCase(); } catch { return value.trim().toLowerCase().replace(/\/$/, ""); }
}

export function isDuplicateSource(candidate: Pick<KnowledgeSource, "doi" | "url">, existing: KnowledgeSource[]): KnowledgeSource | null {
  const doi = candidate.doi ? normalizeDoi(candidate.doi) : null;
  const url = canonicalSourceUrl(candidate.url);
  return existing.find(source => (doi && source.doi && normalizeDoi(source.doi) === doi) || canonicalSourceUrl(source.url) === url) ?? null;
}
