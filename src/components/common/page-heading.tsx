import type { ReactNode } from "react";

export type PageHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export function PageHeading({ title, description, action }: PageHeadingProps) {
  return (
    <header className="cl-page-heading">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="cl-page-heading-action">{action}</div> : null}
    </header>
  );
}
