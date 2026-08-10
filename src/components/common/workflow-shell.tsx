import type { ReactNode } from "react";
import { PageHeading } from "./page-heading";

export type WorkflowShellProps = {
  title: ReactNode;
  description?: ReactNode;
  steps: string[];
  currentStep: number;
  aside?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

export function WorkflowShell({ title, description, steps, currentStep, aside, children, actions }: WorkflowShellProps) {
  return (
    <section className="cl-workflow-shell">
      <PageHeading title={title} description={description} />
      <nav className="cl-workflow-progress" aria-label="ความคืบหน้า">
        <ol>
          {steps.map((step, index) => (
            <li aria-current={index === currentStep ? "step" : undefined} data-complete={index < currentStep ? "true" : undefined} key={step}>
              <span aria-hidden="true">{index < currentStep ? "✓" : index + 1}</span>
              {index + 1} {step}
            </li>
          ))}
        </ol>
      </nav>
      <div className="cl-workflow-grid">
        <div className="cl-workflow-main">{children}</div>
        {aside ? <aside className="cl-workflow-aside" aria-label="สรุปสำหรับตรวจทาน">{aside}</aside> : null}
      </div>
      {actions ? <div className="cl-workflow-actions">{actions}</div> : null}
    </section>
  );
}
