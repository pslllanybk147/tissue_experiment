import { Doors } from "@/components/guide/doors";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default function HomePage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <Doors />
    </GuideShell>
  );
}
