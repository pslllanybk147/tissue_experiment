import { notFound } from "next/navigation";
import { allSlugs, resolveBySlug } from "@/lib/manual/registry";
import { sourceById } from "@/lib/manual/sources";
import { manualSummary } from "@/lib/manual/summary";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

const originLabel = { core: "แกนกลาง", override: "ปรับค่า", pack: "เขียนเอง" } as const;
const evidenceLabel = { "species-direct": "ตรงพันธุ์", adapted: "ประยุกต์", unsupported: "ยังไม่มีงานรองรับ" } as const;

export default async function AdminManualDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manual = resolveBySlug(slug);
  if (!manual) notFound();
  const summary = manualSummary(slug)!;

  return (
    <main style={{ padding: "32px", fontFamily: "system-ui, sans-serif", maxWidth: "820px" }}>
      <h1>{manual.scientificName}</h1>
      <p>{manual.summary}</p>
      <p>
        {summary.stepCount} ขั้น · แกนกลาง {summary.byOrigin.core} · ปรับค่า {summary.byOrigin.override} · เขียนเอง {summary.byOrigin.pack}
      </p>

      <h2>สูตรอาหาร</h2>
      {manual.mediaRecipes.map((recipe) => (
        <section key={recipe.id}>
          <h3>{recipe.title} · {evidenceLabel[recipe.evidence.level]}</h3>
          <p>pH {recipe.pH}</p>
          <ul>
            {recipe.ingredients.map((item) => (
              <li key={item.name}>{item.name} {item.amountPerLiter} {item.unit}{item.note ? ` — ${item.note}` : ""}</li>
            ))}
          </ul>
          {recipe.evidence.note ? <p>{recipe.evidence.note}</p> : null}
        </section>
      ))}

      <h2>ขั้นตอน</h2>
      {manual.steps.map((step) => (
        <article key={step.id} style={{ borderTop: "1px solid #ccc", paddingTop: "16px", marginTop: "16px" }}>
          <h3>{step.order + 1}. {step.title}</h3>
          <p>{originLabel[step.origin]} · {evidenceLabel[step.evidence.level]}</p>
          <p>{step.summary}</p>
          <p>{step.why}</p>
          <h4>ลงมือทำ</h4>
          <ol>{step.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          <h4>ผ่านเมื่อ</h4>
          <ul>{step.passCriteria.map((item) => <li key={item}>{item}</li>)}</ul>
          {step.stopConditions.length ? (
            <>
              <h4>หยุดทันทีถ้า</h4>
              <ul>{step.stopConditions.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          ) : null}
          {step.safetyNotes.length ? (
            <>
              <h4>ความปลอดภัย</h4>
              <ul>{step.safetyNotes.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          ) : null}
          {step.evidence.note ? <p>หมายเหตุหลักฐาน {step.evidence.note}</p> : null}
          <ul>
            {step.evidence.sourceIds.map((id) => {
              const source = sourceById(id);
              return <li key={id}>{source ? <a href={source.url}>{source.title}</a> : id}</li>;
            })}
          </ul>
        </article>
      ))}
    </main>
  );
}
