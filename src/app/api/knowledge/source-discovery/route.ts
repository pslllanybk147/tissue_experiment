import { NextResponse } from "next/server";
import { extractOpenAlexId, extractPubMedId, normalizeDoi, type DiscoveredSourceMetadata } from "../../../../lib/domain/source-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticate(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  const { verifyFirebaseToken } = await import("../../../../lib/firebase/token-verifier");
  try { return (await verifyFirebaseToken(header.slice(7))).uid; } catch { throw new Response(JSON.stringify({ error: "Invalid authentication" }), { status: 401 }); }
}

function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function dateFromParts(value: unknown): string | null { const parts = Array.isArray(value) && Array.isArray(value[0]) ? value[0].filter((item: unknown) => typeof item === "number") : []; return parts.length ? parts.map((part: number, index: number) => index === 0 ? String(part).padStart(4, "0") : String(part).padStart(2, "0")).join("-") : null; }

async function crossref(doi: string, fetcher: typeof fetch): Promise<DiscoveredSourceMetadata> {
  const response = await fetcher(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Crossref metadata not found");
  const body = await response.json() as { message?: Record<string, unknown> };
  const message = body.message ?? {};
  const authors = Array.isArray(message.author) ? message.author.map(item => { const author = item as Record<string, unknown>; return [text(author.given), text(author.family)].filter(Boolean).join(" "); }).filter(Boolean).join(", ") : "";
  return { provider: "Crossref", title: Array.isArray(message.title) ? text(message.title[0]) : text(message.title), url: text(message.URL) || `https://doi.org/${doi}`, doi, authors, publishedAt: dateFromParts((message.published as Record<string, unknown> | undefined)?.["date-parts"]), sourceType: "journal" };
}

async function openAlex(id: string, fetcher: typeof fetch): Promise<DiscoveredSourceMetadata> {
  const response = await fetcher(`https://api.openalex.org/works/${encodeURIComponent(id)}`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("OpenAlex metadata not found");
  const body = await response.json() as Record<string, unknown>;
  const authorships = Array.isArray(body.authorships) ? body.authorships.map(item => text((item as Record<string, unknown>).author && ((item as Record<string, unknown>).author as Record<string, unknown>).display_name)).filter(Boolean).join(", ") : "";
  const doi = normalizeDoi(text(body.doi));
  return { provider: "OpenAlex", title: text(body.title), url: text(body.id), doi, authors: authorships, publishedAt: text(body.publication_date) || null, sourceType: "journal" };
}

async function pubmed(id: string, fetcher: typeof fetch): Promise<DiscoveredSourceMetadata> {
  const response = await fetcher(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${encodeURIComponent(id)}&retmode=json`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("PubMed metadata not found");
  const body = await response.json() as { result?: Record<string, Record<string, unknown>> };
  const result = body.result?.[id];
  if (!result) throw new Error("PubMed metadata not found");
  const authors = Array.isArray(result.authors) ? result.authors.map(item => text((item as Record<string, unknown>).name)).filter(Boolean).join(", ") : "";
  return { provider: "PubMed", title: text(result.title), url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, doi: normalizeDoi(text(result.elocationid)), authors, publishedAt: text(result.pubdate) || null, sourceType: "journal" };
}

export async function POST(request: Request) {
  try {
    await authenticate(request);
    const body = await request.json() as { identifier?: unknown };
    const identifier = text(body.identifier);
    if (!identifier || identifier.length > 500) return NextResponse.json({ error: "กรุณาระบุ DOI หรือ URL" }, { status: 400 });
    const doi = normalizeDoi(identifier);
    const pubmedId = extractPubMedId(identifier);
    const openAlexId = extractOpenAlexId(identifier);
    if (!doi && !pubmedId && !openAlexId) return NextResponse.json({ error: "รองรับ DOI, PubMed URL หรือ OpenAlex work URL เท่านั้น" }, { status: 422 });
    const fetcher = fetch;
    let metadata: DiscoveredSourceMetadata;
    if (doi) metadata = await crossref(doi, fetcher);
    else if (pubmedId) metadata = await pubmed(pubmedId, fetcher);
    else metadata = await openAlex(openAlexId as string, fetcher);
    return NextResponse.json(metadata, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Response) return new NextResponse(error.body, { status: error.status, headers: { "content-type": "application/json" } });
    console.error("source discovery failure", { errorName: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json({ error: "ดึง metadata ไม่สำเร็จ กรุณาตรวจ DOI/URL หรือกรอกข้อมูลเอง" }, { status: 502 });
  }
}
