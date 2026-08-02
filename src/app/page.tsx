import { GuideShell } from "@/components/guide/guide-shell";
import { PlantPicker, type PlantPickerItem } from "@/components/guide/plant-picker";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { plantPacks } from "@/lib/manual/registry";
import { manualSummary } from "@/lib/manual/summary";

export default function HomePage() {
  const plants: PlantPickerItem[] = plantPacks.map((pack) => ({
    slug: pack.slug,
    scientificName: pack.scientificName,
    commonName: pack.commonName,
    summary: pack.summary,
    stepCount: manualSummary(pack.slug)?.stepCount ?? 0,
    durationLabel: pack.durationLabel,
  }));

  return (
    <GuideShell action={<ThemeToggle />}>
      <PlantPicker plants={plants} />
    </GuideShell>
  );
}
