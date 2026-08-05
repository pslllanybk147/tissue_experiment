import { GuideShell } from "@/components/guide/guide-shell";
import { ProblemList } from "@/components/guide/problem-list";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default async function ProblemPage({
  searchParams,
}: {
  searchParams: Promise<{ symptom?: string | string[] }>;
}) {
  const { symptom } = await searchParams;
  const selected = Array.isArray(symptom) ? symptom[0] : symptom;

  return (
    <GuideShell action={<ThemeToggle />}>
      <ProblemList selected={selected} />
    </GuideShell>
  );
}
