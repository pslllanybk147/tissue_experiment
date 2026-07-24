#!/usr/bin/env node
import { createReadStream, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

const input = process.argv[2];
const output = process.argv[3] ?? "src/lib/domain/philodendron-catalog.generated.json";
if (!input) {
  console.error("Usage: node scripts/import-philodendron-wcvp.mjs <wcvp_taxon.csv> [output.json]");
  process.exit(1);
}

const lines = createInterface({ input: createReadStream(resolve(input)), crlfDelay: Infinity });
let indexes = {};
let headerRead = false;
const records = [];
for await (const line of lines) {
  if (!line.trim()) continue;
  const fields = line.split("|");
  if (!headerRead) {
    fields.forEach((field, index) => { indexes[field.toLowerCase()] = index; });
    headerRead = true;
    continue;
  }
  const get = (name) => fields[indexes[name]] ?? "";
  if (get("genus") !== "Philodendron" || get("taxonrank").toLowerCase() !== "species" || get("taxonomicstatus") !== "Accepted") continue;
  const scientificName = get("scientfiicname") || `Philodendron ${get("specificepithet")}`;
  records.push({
    id: `wcvp-${get("taxonid")}`,
    scientificName,
    displayName: scientificName,
    rank: "species",
    parentId: "genus-philodendron",
    synonyms: [],
    commonNames: [],
    confidence: "High",
    evidenceState: "Verified",
    sourceIds: ["source-kew-wcvp-v15"],
    authority: get("scientfiicnameauthorship"),
    wcvpTaxonId: get("taxonid"),
    sourceUrl: get("references"),
    createdAt: "",
    updatedAt: "",
  });
}

mkdirSync(resolve(output, ".."), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify(records, null, 2)}\n`, "utf8");
console.log(`Imported ${records.length} accepted Philodendron species from WCVP`);
