import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ActionBar } from "./action-bar";
import { DataList } from "./data-list";
import { FieldGroup } from "./field-group";
import { MethodSelector } from "./method-selector";
import { PageHeading } from "./page-heading";
import { StatusNotice } from "./status-notice";
import { WorkflowShell } from "./workflow-shell";

describe("Calm Lab workflow primitives", () => {
  it("associates field hint and error with the real control", () => {
    const html = renderToStaticMarkup(
      <FieldGroup id="ppm" label="ค่า ppm" hint="กรอกค่าที่วัดจริง" error="ต้องมากกว่าศูนย์">
        <input id="ppm" aria-invalid="true" />
      </FieldGroup>,
    );

    expect(html).toContain('aria-describedby="ppm-hint ppm-error"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('for="ppm"');
  });

  it("keeps disabled method reasons and native grouping visible", () => {
    const html = renderToStaticMarkup(
      <MethodSelector
        legend="วิธีทำให้อาหารปลอดเชื้อ"
        name="medium"
        value={null}
        options={[
          {
            value: "pressure",
            label: "ใช้แรงดัน",
            description: "ใช้หม้อนึ่งหรือหม้ออัดแรงดัน",
            disabled: true,
            disabledReason: "ยังไม่มีหม้อนึ่งหรือหม้ออัดแรงดัน",
          },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain("ยังไม่มีหม้อนึ่งหรือหม้ออัดแรงดัน");
    expect(html).toContain("disabled");
  });

  it("marks the selected method without relying on color", () => {
    const html = renderToStaticMarkup(
      <MethodSelector
        name="rinse"
        value="water"
        options={[{ value: "water", label: "น้ำปลอดเชื้อ", description: "ล้างตาม protocol" }]}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("เลือกแล้ว");
    expect(html).toContain("checked");
  });

  it("uses semantic notice and data markup", () => {
    const notice = renderToStaticMarkup(<StatusNotice tone="error" title="บันทึกไม่สำเร็จ">ลองอีกครั้ง</StatusNotice>);
    const data = renderToStaticMarkup(<DataList items={[{ term: "สถานะ", detail: "เตรียมแล้ว" }]} />);

    expect(notice).toContain('role="alert"');
    expect(notice).toContain('data-tone="error"');
    expect(data).toContain("<dl");
    expect(data).toContain("<dt");
    expect(data).toContain("<dd");
  });

  it("keeps one primary action and one page heading", () => {
    const actions = renderToStaticMarkup(<ActionBar primary={<button>ยืนยัน</button>} secondary={<button>ย้อนกลับ</button>} />);
    const heading = renderToStaticMarkup(<PageHeading title="ตั้งค่ารอบ" description="ตรวจทานก่อนเริ่ม" />);

    expect((actions.match(/cl-action-primary/g) ?? [])).toHaveLength(1);
    expect(heading).toContain("<h1");
  });

  it("exposes ordered workflow progress and current step", () => {
    const html = renderToStaticMarkup(
      <WorkflowShell title="ตั้งค่ารอบ" steps={["ข้อมูลสาร", "เลือกวิธี", "ตรวจทาน"]} currentStep={1}>
        เนื้อหาขั้นตอน
      </WorkflowShell>,
    );

    expect(html).toContain("<ol");
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("2 เลือกวิธี");
  });
});
