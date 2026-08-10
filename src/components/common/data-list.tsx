import type { ReactNode } from "react";

export type Density = "comfortable" | "compact";
export type DataListItem = { term: ReactNode; detail: ReactNode };

export function DataList({ items, density = "comfortable" }: { items: DataListItem[]; density?: Density }) {
  return (
    <dl className="cl-data-list" data-density={density}>
      {items.map((item, index) => (
        <div className="cl-data-row" key={index}>
          <dt>{item.term}</dt>
          <dd>{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
