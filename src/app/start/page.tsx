import { GuideShell } from "@/components/guide/guide-shell";
import { StartList } from "@/components/guide/start-list";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default function StartPage() {
  return (
    <GuideShell action={<ThemeToggle />}>
      <StartList />
    </GuideShell>
  );
}
