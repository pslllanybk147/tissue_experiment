import type { ReactNode } from "react";

export type NoticeTone = "info" | "success" | "warning" | "error" | "blocked";

export type StatusNoticeProps = {
  tone?: NoticeTone;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
};

export function StatusNotice({ tone = "info", title, children, action }: StatusNoticeProps) {
  const urgent = tone === "error" || tone === "blocked";
  return (
    <section className="cl-status-notice" data-tone={tone} role={urgent ? "alert" : "status"}>
      <div>
        <strong>{title}</strong>
        {children ? <div className="cl-status-copy">{children}</div> : null}
      </div>
      {action ? <div className="cl-status-action">{action}</div> : null}
    </section>
  );
}
