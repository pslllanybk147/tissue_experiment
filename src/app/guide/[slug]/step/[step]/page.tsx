import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide/guide-shell";
import { StepDetail } from "@/components/guide/step-detail";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { allSlugs, resolveBySlug } from "@/lib/manual/registry";

export function generateStaticParams() {
  return allSlugs().flatMap((slug) => {
    const manual = resolveBySlug(slug);
    return (manual?.steps ?? []).map((item) => ({ slug, step: String(item.order + 1) }));
  });
}

export default async function GuideStepPage({ params }: { params: Promise<{ slug: string; step: string }> }) {
  const { slug, step } = await params;
  const manual = resolveBySlug(slug);
  if (!manual) notFound();

  const number = Number(step);
  if (!Number.isInteger(number) || number < 1 || number > manual.steps.length) notFound();

  return (
    <GuideShell action={<ThemeToggle />}>
      <StepDetail manual={manual} step={manual.steps[number - 1]} />
    </GuideShell>
  );
}
