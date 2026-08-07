import { Doors } from "@/components/guide/doors";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { HeroJar } from "@/components/home/hero-jar";

export default function HomePage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <HeroJar />
      <Doors />
    </GuideShell>
  );
}
