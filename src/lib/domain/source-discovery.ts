export type DiscoveredSourceMetadata = {
  provider: "Crossref" | "OpenAlex" | "PubMed";
  title: string;
  url: string;
  doi: string | null;
  authors: string;
  publishedAt: string | null;
  sourceType: "journal" | "book" | "database" | "website" | "user-note";
};

export function normalizeDoi(value: string): string | null {
  const input = value.trim().replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  return /^10\.\d{4,9}\/\S+$/i.test(input) ? input.replace(/[.)]+$/, "") : null;
}

export function extractPubMedId(value: string): string | null {
  try { const url = new URL(value); if (!/(^|\.)pubmed\.ncbi\.nlm\.nih\.gov$/i.test(url.hostname)) return null; const match = url.pathname.match(/\/(\d+)(?:\/|$)/); return match?.[1] ?? null; } catch { return null; }
}

export function extractOpenAlexId(value: string): string | null {
  try { const url = new URL(value); if (!/(^|\.)openalex\.org$/i.test(url.hostname)) return null; const match = url.pathname.match(/\/(W\d+)\/?$/i); return match?.[1] ?? null; } catch { return null; }
}
