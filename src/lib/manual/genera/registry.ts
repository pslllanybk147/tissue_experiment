import { adenium } from "./adenium";
import { alocasia } from "./alocasia";
import { anthurium } from "./anthurium";
import { bambusa } from "./bambusa";
import { begonia } from "./begonia";
import { dendrobium } from "./dendrobium";
import { epipremnum } from "./epipremnum";
import { monstera } from "./monstera";
import { musa } from "./musa";
import { philodendron } from "./philodendron";
import { sansevieria } from "./sansevieria";
import { scindapsus } from "./scindapsus";
import { syngonium } from "./syngonium";
import { zingiber } from "./zingiber";
import type { GenusPack } from "./types";

export const generaPacks: GenusPack[] = [
  philodendron,
  monstera,
  epipremnum,
  syngonium,
  anthurium,
  alocasia,
  sansevieria,
  begonia,
  zingiber,
  musa,
  dendrobium,
  adenium,
  bambusa,
  scindapsus,
];

export function genusById(id: string): GenusPack | null {
  return generaPacks.find((pack) => pack.id === id) ?? null;
}
