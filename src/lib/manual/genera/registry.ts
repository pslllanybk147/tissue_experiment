import { adenium } from "./adenium";
import { alocasia } from "./alocasia";
import { anthurium } from "./anthurium";
import { bambusa } from "./bambusa";
import { begonia } from "./begonia";
import { bolbitis } from "./bolbitis";
import { dendrobium } from "./dendrobium";
import { epipremnum } from "./epipremnum";
import { hemianthus } from "./hemianthus";
import { microsorum } from "./microsorum";
import { monstera } from "./monstera";
import { musa } from "./musa";
import { philodendron } from "./philodendron";
import { rhaphidophora } from "./rhaphidophora";
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
  rhaphidophora,
  hemianthus,
  microsorum,
  bolbitis,
];

export function genusById(id: string): GenusPack | null {
  return generaPacks.find((pack) => pack.id === id) ?? null;
}
