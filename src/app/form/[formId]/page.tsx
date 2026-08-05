import { notFound } from "next/navigation";
import { FormDetail, type FormPlantLink } from "@/components/guide/form-detail";
import { GuideShell } from "@/components/guide/guide-shell";
import { ThemeToggle } from "@/components/guide/theme-toggle";
import { formById, growthForms } from "@/lib/manual/forms/registry";
import { plantPacks } from "@/lib/manual/registry";

export function generateStaticParams() {
  return growthForms.map((form) => ({ formId: form.id }));
}

export default async function FormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const form = formById(formId);
  if (!form) notFound();

  const plants: FormPlantLink[] = plantPacks
    .filter((pack) => pack.growthFormId === form.id)
    .map((pack) => ({ slug: pack.slug, commonName: pack.commonName }));

  return (
    <GuideShell action={<ThemeToggle />}>
      <FormDetail form={form} plants={plants} />
    </GuideShell>
  );
}
