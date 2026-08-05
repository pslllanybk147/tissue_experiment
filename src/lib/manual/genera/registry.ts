import { philodendron } from "./philodendron";
import type { GenusPack } from "./types";

export const generaPacks: GenusPack[] = [philodendron];

export function genusById(id: string): GenusPack | null {
  return generaPacks.find((pack) => pack.id === id) ?? null;
}
