export type HormoneStockId = "ba" | "bap" | "naa" | "iba";

export function stockIdForIngredient(name: string): HormoneStockId | null {
  const normalized = name.trim().toUpperCase();
  if (normalized === "BA" || normalized === "6-BA") return "ba";
  if (normalized === "BAP" || normalized === "6-BA (BAP)") return "bap";
  if (normalized === "NAA") return "naa";
  if (normalized === "IBA") return "iba";
  return null;
}
