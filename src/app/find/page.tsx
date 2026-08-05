import { FormFinder, type FinderAnswers } from "@/components/guide/form-finder";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default async function FindPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const answers: FinderAnswers = {};
  for (const [key, value] of Object.entries(raw)) {
    answers[key] = Array.isArray(value) ? value[0] : value;
  }

  return (
    <GuideShell action={<ThemeToggle />}>
      <FormFinder answers={answers} />
    </GuideShell>
  );
}
