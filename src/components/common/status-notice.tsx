import type { ReactNode } from "react";

export type NoticeTone = "info" | "success" | "warning" | "error" | "blocked";

export type StatusNoticeProps = {
  tone?: NoticeTone;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  live?: boolean;
};

const symbolByTone: Record<NoticeTone, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "!",
  blocked: "×",
};

export function StatusNotice({ tone = "info", title, children, action, live = true }: StatusNoticeProps) {
  const urgent = tone === "error" || tone === "blocked";
  return (
    <section className="cl-status-notice" data-tone={tone} role={live ? (urgent ? "alert" : "status") : "note"}>
      <span className="cl-status-symbol" aria-hidden="true">{symbolByTone[tone]}</span>
      <div className="cl-status-content">
        <strong className="cl-status-title">{title}</strong>
        {children ? <div className="cl-status-copy">{children}</div> : null}
      </div>
      {action ? <div className="cl-status-action">{action}</div> : null}
    </section>
  );
}
