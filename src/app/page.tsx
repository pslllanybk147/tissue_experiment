import { GuideShell } from "@/components/guide/guide-shell";
import { StartList } from "@/components/guide/start-list";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { HeroJar } from "@/components/home/hero-jar";

export default function HomePage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <HeroJar />
      <StartList />
    </GuideShell>
  );
}
