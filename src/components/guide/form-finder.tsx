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
      <>
        <h1 className="pl-h1">{question.ask}</h1>
        <p className="pl-lede" style={{ marginBottom: "20px" }}>
          เอาต้นจริงมาวางตรงหน้าแล้วดูไปด้วย จะตอบง่ายกว่านึกเอา
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {question.choices.map((choice) => (
            <li key={choice.value}>
              <Link
                className="pl-card pl-link"
                href={hrefWith(answers, question.key, choice.value)}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <p className="pl-h2">{choice.label}</p>
                <p className="pl-lede" style={{ marginTop: "6px" }}>{choice.hint}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="pl-meta" style={{ marginTop: "22px" }}>
          <Link className="pl-link" href="/find">เริ่มตอบใหม่</Link>
        </p>
      </>
    );
  }

  const form = outcome ? formById(outcome.formId) : null;

  if (outcome && form) {
    return (
      <>
        <h1 className="pl-h1">ต้นของคุณน่าจะเป็น {form.label}</h1>
        <p className="pl-lede" style={{ marginTop: "8px" }}>{form.plainDescription}</p>
        <p style={{ marginTop: "20px" }}>
          <Link
            className="pl-card pl-link"
            href={`/form/${form.id}`}
            style={{ display: "block", color: "inherit", textDecoration: "none" }}
          >
            <span className="pl-h2" style={{ display: "block" }}>เปิดคู่มือของทรงนี้</span>
            <span className="pl-lede" style={{ display: "block", marginTop: "6px" }}>
              ดูจุดสังเกตที่ต้องหา และตำแหน่งที่ต้องตัด
            </span>
          </Link>
        </p>
        <p className="pl-meta" style={{ marginTop: "22px" }}>
          ไม่ตรงกับต้นของคุณ? <Link className="pl-link" href="/find">เริ่มตอบใหม่</Link>
        </p>
      </>
    );
  }

  const uncovered = outcome?.reason === "uncovered";

  return (
    <>
      <h1 className="pl-h1">{uncovered ? "ต้นแบบนี้ยังไม่อยู่ในระบบ" : "ยังไม่มีคู่มือของทรงนี้"}</h1>
      <p className="pl-lede" style={{ marginTop: "8px" }}>
        {uncovered
          ? "ตอนนี้เราครอบคลุมแปดทรงที่พบบ่อยที่สุด ต้นของคุณยังไม่เข้าทรงใดในนั้น เราจึงยังระบุตำแหน่งตัดให้ไม่ได้"
          : "เราระบุได้ว่าต้นของคุณเป็นทรงไหน แต่ยังไม่ได้เขียนคู่มือของทรงนั้น"}
        {" "}เราไม่เอาคู่มือของทรงอื่นมาให้ เพราะตำแหน่งตัดของแต่ละทรงต่างกันจริง ๆ และตัดผิดตำแหน่งต้นจะไม่ขึ้น
      </p>
      <p className="pl-meta" style={{ marginTop: "22px" }}>
        <Link className="pl-link" href="/find">เริ่มตอบใหม่</Link> · <Link className="pl-link" href="/">กลับหน้าแรก</Link>
      </p>
    </>
  );
}
