import { notFound } from "next/navigation";
import { GuideShell } from "@/components/guide/guide-shell";
import { StepMap } from "@/components/guide/step-map";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { allSlugs, resolveBySlug } from "@/lib/manual/registry";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manual = resolveBySlug(slug);
  if (!manual) notFound();

  return (
    <GuideShell action={<ThemeToggle />}>
      <StepMap manual={manual} />
    </GuideShell>
  );
}
