import Link from "next/link";
import { resolveFinder } from "@/lib/manual/forms/finder";
import { formById } from "@/lib/manual/forms/registry";

export type FinderAnswers = Record<string, string | undefined>;

function hrefWith(answers: FinderAnswers, key: string, value: string): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(answers)) if (v) params.set(k, v);
  params.set(key, value);
  return `/find?${params.toString()}`;
}

export function FormFinder({ answers }: { answers: FinderAnswers }) {
  const { question, outcome } = resolveFinder(answers);

  if (question) {
    return (
      <section className="cl-public-section">
        <header className="cl-page-heading"><div><h1>{question.ask}</h1><p>
          เอาต้นจริงมาวางตรงหน้าแล้วดูไปด้วย จะตอบง่ายกว่านึกเอา
        </p></div></header>
        <ul className="cl-choice-list">
          {question.choices.map((choice) => (
            <li key={choice.value}>
              <Link
                className="cl-choice-row"
                href={hrefWith(answers, question.key, choice.value)}
              >
                <strong>{choice.label}</strong>
                <span>{choice.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="cl-public-links">
          <Link className="cl-inline-link" href="/find">เริ่มตอบใหม่</Link>
        </p>
      </section>
    );
  }

  const form = outcome ? formById(outcome.formId) : null;

  if (outcome && form) {
    return (
      <section className="cl-public-section">
        <header className="cl-page-heading"><div><h1>ต้นของคุณน่าจะเป็น {form.label}</h1><p>{form.plainDescription}</p></div></header>
        <div>
          <Link
            className="cl-choice-row"
            href={`/form/${form.id}`}
          >
            <strong>เปิดคู่มือของทรงนี้</strong>
            <span>
              ดูจุดสังเกตที่ต้องหา และตำแหน่งที่ต้องตัด
            </span>
          </Link>
        </div>
        <p className="cl-public-links">
          ไม่ตรงกับต้นของคุณ? <Link className="cl-inline-link" href="/find">เริ่มตอบใหม่</Link>
        </p>
      </section>
    );
  }

  const uncovered = outcome?.reason === "uncovered";

  return (
    <section className="cl-public-section">
      <header className="cl-page-heading"><div><h1>{uncovered ? "ต้นแบบนี้ยังไม่อยู่ในระบบ" : "ยังไม่มีคู่มือของทรงนี้"}</h1><p>
        {uncovered
          ? "ตอนนี้เราครอบคลุมแปดทรงที่พบบ่อยที่สุด ต้นของคุณยังไม่เข้าทรงใดในนั้น เราจึงยังระบุตำแหน่งตัดให้ไม่ได้"
          : "เราระบุได้ว่าต้นของคุณเป็นทรงไหน แต่ยังไม่ได้เขียนคู่มือของทรงนั้น"}
        {" "}เราไม่เอาคู่มือของทรงอื่นมาให้ เพราะตำแหน่งตัดของแต่ละทรงต่างกันจริง ๆ และตัดผิดตำแหน่งต้นจะไม่ขึ้น
      </p></div></header>
      <p className="cl-public-links">
        <Link className="cl-inline-link" href="/find">เริ่มตอบใหม่</Link> · <Link className="cl-inline-link" href="/">กลับหน้าแรก</Link>
      </p>
    </section>
  );
}
