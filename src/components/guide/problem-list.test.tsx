import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { troubleshootingEntries } from "@/lib/manual/troubleshooting";
import { ProblemList } from "./problem-list";

describe("การเข้าจากอาการ", () => {
  it("ยังไม่เลือกอาการ แสดงอาการทั้งหมดให้เลือก", () => {
    const html = renderToStaticMarkup(<ProblemList selected={undefined} />);
    for (const entry of Object.values(troubleshootingEntries)) {
      expect(html, `ไม่มีอาการ ${entry.id}`).toContain(entry.symptom);
    }
  });

  it("เลือกอาการแล้ว แสดงสาเหตุและสิ่งที่ต้องทำ", () => {
    const entry = troubleshootingEntries["browning-phenolic"];
    const html = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    expect(html).toContain(entry.likelyCause);
    for (const action of entry.actions) expect(html).toContain(action);
  });

  it("แสดงวิธีแยกจากอาการที่หน้าตาคล้ายกัน เพราะแก้คนละทาง", () => {
    const html = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    expect(html).toContain(troubleshootingEntries["browning-phenolic"].distinguish!);
  });

  it("แสดงระดับหลักฐานของวิธีแก้", () => {
    const html = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    expect(html).toContain("ระดับหลักฐาน");
  });

  it("อาการที่ไม่มีอยู่ ไม่พัง และพากลับไปเลือกใหม่", () => {
    const html = renderToStaticMarkup(<ProblemList selected="ไม่มีอาการนี้" />);
    expect(html).toContain('href="/problem"');
    expect(html).toContain('class="cl-inline-link" href="/problem"');
  });

  it("ทำให้ทางช่วยเหลือในเนื้อหาเห็นเป็นลิงก์ แต่ไม่เปลี่ยนรายการอาการเป็น inline link", () => {
    const selectedHtml = renderToStaticMarkup(<ProblemList selected="browning-phenolic" />);
    const listHtml = renderToStaticMarkup(<ProblemList selected={undefined} />);

    expect(selectedHtml).toContain('class="cl-inline-link" href="/substances"');
    expect(selectedHtml).toContain('class="cl-inline-link" href="/problem"');
    expect(listHtml).toContain('class="cl-choice-row" href="/problem?symptom=');
    expect(listHtml).not.toContain('class="cl-choice-row cl-inline-link"');
  });
});
