import { GuideShell } from "@/components/guide/guide-shell";
import { SubstanceList } from "@/components/guide/substance-list";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default function SubstancesPage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <SubstanceList />
    </GuideShell>
  );
}
