#!/usr/bin/env node
// Finds candidate reference images for a plant species from open, license-checkable
// sources (GBIF herbarium specimens, Wikimedia Commons, iNaturalist research-grade
// observations). Downloads only images with a reusable license and writes a
// manifest for a human to review, caption, and tier per docs/superpowers/newplant_protocol.md
// section 5. This script never writes into illustrations.tsx or sources.ts directly.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, extname } from "node:path";

const scientificName = process.argv[2];
const args = process.argv.slice(3);

function readFlag(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

if (!scientificName) {
  console.error(
    'Usage: node scripts/find-plant-images.mjs "<scientific name>" [--genus <genus>] [--out <dir>]'
  );
  process.exit(1);
}

const genus = readFlag("genus", scientificName.split(" ")[0]);
const slug = scientificName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const outDir = readFlag("out", `docs/superpowers/image-candidates/${slug}`);

// Licenses considered safe to keep and cite/crop with attribution.
const OPEN_LICENSES = new Set(["cc0", "cc-by", "cc-by-sa", "cc-by-4.0", "cc-by-sa-4.0", "public domain"]);

function normalizeLicense(raw) {
  if (!raw) return { code: "unknown", open: false };
  const code = String(raw).toLowerCase().trim();
  if (code.includes("cc0") || code.includes("public domain")) return { code: "cc0", open: true };
  if (code.includes("cc-by-sa") || code.includes("cc by-sa")) return { code: "cc-by-sa", open: true };
  if (code.includes("cc-by") || code.includes("cc by")) return { code: "cc-by", open: true };
  if (code.includes("nc") || code.includes("nd")) return { code, open: false };
  return { code, open: OPEN_LICENSES.has(code) };
}

// Wikimedia requires a descriptive User-Agent with contact info, or it rate-limits
// generic clients aggressively. See https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT = "plantlover-lab-image-search/1.0 (https://github.com/pslllanybk147/tissue_experiment)";

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      console.warn(`  warning: ${url} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`  warning: ${url} failed — ${error.message}`);
    return null;
  }
}

async function searchGbif(name) {
  const data = await safeFetchJson(
    `https://api.gbif.org/v1/occurrence/search?q=${encodeURIComponent(name)}&mediaType=StillImage&limit=15`
  );
  if (!data?.results) return [];
  const candidates = [];
  for (const occurrence of data.results) {
    for (const media of occurrence.media ?? []) {
      if (!media.identifier) continue;
      candidates.push({
        source: "gbif",
        tier: "B",
        imageUrl: media.identifier,
        pageUrl: `https://www.gbif.org/occurrence/${occurrence.key}`,
        license: normalizeLicense(media.license ?? occurrence.license),
        credit: media.creator ?? media.rightsHolder ?? occurrence.recordedBy ?? "unknown",
        matchedName: occurrence.scientificName ?? name,
        note: "herbarium/occurrence record — structure reference, not a cutting instruction",
      });
    }
  }
  return candidates;
}

async function searchWikimediaCommons(name) {
  const search = await safeFetchJson(
    `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=6&format=json&srlimit=10`
  );
  const titles = search?.query?.search?.map((entry) => entry.title) ?? [];
  if (titles.length === 0) return [];
  const info = await safeFetchJson(
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.join("|"))}&prop=imageinfo&iiprop=url|extmetadata&format=json`
  );
  const pages = info?.query?.pages ?? {};
  const candidates = [];
  for (const page of Object.values(pages)) {
    const imageInfo = page.imageinfo?.[0];
    if (!imageInfo) continue;
    const meta = imageInfo.extmetadata ?? {};
    candidates.push({
      source: "wikimedia-commons",
      tier: "C",
      imageUrl: imageInfo.url,
      pageUrl: imageInfo.descriptionurl,
      license: normalizeLicense(meta.LicenseShortName?.value),
      credit: meta.Artist?.value?.replace(/<[^>]+>/g, "") ?? "unknown",
      matchedName: page.title,
      note: "commons image matched by search — verify it actually depicts this species before use",
    });
  }
  return candidates;
}

async function searchINaturalist(genusName) {
  const data = await safeFetchJson(
    `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(genusName)}&photos=true&quality_grade=research&per_page=10`
  );
  if (!data?.results) return [];
  const candidates = [];
  for (const observation of data.results) {
    for (const photo of observation.photos ?? []) {
      candidates.push({
        source: "inaturalist",
        tier: "D",
        imageUrl: (photo.url ?? "").replace("square", "large"),
        pageUrl: `https://www.inaturalist.org/observations/${observation.id}`,
        license: normalizeLicense(photo.license_code),
        credit: photo.attribution ?? "unknown",
        matchedName: observation.taxon?.name ?? genusName,
        note: "related species/genus observation — caption as not this cultivar directly",
      });
    }
  }
  return candidates;
}

function extensionFor(url) {
  const ext = extname(new URL(url).pathname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
}

async function downloadImage(candidate, index, attempt = 1) {
  const filename = `${candidate.source}-${index}${extensionFor(candidate.imageUrl)}`;
  const path = resolve(outDir, filename);
  try {
    const res = await fetch(candidate.imageUrl, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 429 && attempt < 3) {
      await sleep(1000 * attempt);
      return downloadImage(candidate, index, attempt + 1);
    }
    if (!res.ok) {
      console.warn(`  warning: could not download ${candidate.imageUrl} (${res.status})`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(path, buffer);
    return filename;
  } catch (error) {
    console.warn(`  warning: could not download ${candidate.imageUrl} — ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`Searching image candidates for "${scientificName}" (genus fallback: ${genus})`);

  const [gbif, commons, inat] = await Promise.all([
    searchGbif(scientificName),
    searchWikimediaCommons(scientificName),
    searchINaturalist(genus),
  ]);

  const all = [...gbif, ...commons, ...inat];
  const openCandidates = all.filter((candidate) => candidate.license.open);
  const restrictedCandidates = all.filter((candidate) => !candidate.license.open);

  console.log(
    `Found ${all.length} candidates (${openCandidates.length} openly licensed, ${restrictedCandidates.length} restricted/unknown — not downloaded)`
  );

  if (openCandidates.length > 0) {
    mkdirSync(resolve(outDir), { recursive: true });
  }

  const manifestEntries = [];
  for (let i = 0; i < openCandidates.length; i += 1) {
    const candidate = openCandidates[i];
    const filename = await downloadImage(candidate, i);
    manifestEntries.push({ ...candidate, filename, downloaded: Boolean(filename) });
    await sleep(150);
  }
  for (const candidate of restrictedCandidates) {
    manifestEntries.push({ ...candidate, filename: null, downloaded: false });
  }

  const manifest = {
    scientificName,
    genus,
    generatedAt: new Date().toISOString(),
    reviewInstructions:
      "Every entry needs a human to: (1) confirm it actually depicts this species/genus, " +
      "(2) confirm the suggested tier (B/C/D) matches docs/superpowers/newplant_protocol.md section 5, " +
      "(3) write the required caption before using it in a guide. Restricted-license entries were " +
      "not downloaded — follow pageUrl to view them if citing facts only, per the license table in section 2.",
    candidates: manifestEntries,
  };

  if (manifestEntries.length > 0) {
    mkdirSync(resolve(outDir), { recursive: true });
    writeFileSync(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`Manifest written to ${outDir}/manifest.json`);
  } else {
    console.log("No candidates found on any channel.");
  }
}

main();
