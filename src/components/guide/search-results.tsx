import Link from "next/link";
import { searchPlants, type SearchHit } from "@/lib/manual/search";

function hrefOf(hit: SearchHit): string {
  return hit.kind === "species" ? `/guide/${hit.slug}` : `/form/${hit.formId}`;
}

const kindNote: Record<SearchHit["kind"], string> = {
  species: "มีคู่มือเฉพาะของต้นนี้",
  genus: "ยังไม่มีคู่มือเฉพาะ ใช้คู่มือระดับทรงของสกุลนี้",
  form: "คู่มือระดับทรง",
};

export function SearchResults({ query }: { query: string }) {
  const hits = searchPlants(query);
  const searched = query.trim().length > 0;

  return (
    <section className="cl-public-section cl-atlas-reading">
      <header className="cl-page-heading"><div><p className="cl-chapter-kicker">ค้นในคู่มือ</p><h1>ค้นหาคู่มือ</h1></div></header>
      <form className="cl-search-form" method="get" action="/search">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="ชื่อต้น เช่น พิงค์ปริ๊นเซส"
          aria-label="ชื่อต้นที่ต้องการค้นหา"
        />
        <button className="cl-button-primary" type="submit">ค้นหา</button>
      </form>

      {!searched ? (
        <p className="cl-support-copy">
          ลองพิมพ์ชื่อที่คุณเรียกต้นนั้น จะเป็นชื่อไทยหรือชื่อวิทยาศาสตร์ก็ได้
          ถ้าไม่รู้ชื่อ ใช้ <Link className="cl-inline-link" href="/find">การไล่ดูจากลักษณะต้น</Link> แทนได้
        </p>
      ) : hits.length > 0 ? (
        <ul className="cl-choice-list">
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.title}`}>
              <Link
                className="cl-choice-row"
                href={hrefOf(hit)}
              >
                <strong>{hit.title}</strong>
                <em>{hit.subtitle}</em>
                <span>{kindNote[hit.kind]}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="cl-empty-state">
          <h2>ยังไม่มีคู่มือของต้นนี้</h2>
          <p>
            เราไม่เดาให้ เพราะตำแหน่งตัดของแต่ละทรงต่างกันจริง ๆ และตัดผิดตำแหน่งต้นจะไม่ขึ้น
            แต่ถ้าคุณบอกลักษณะต้นได้ เราหาทรงให้ได้
          </p>
          <p>
            <Link className="cl-inline-link" href="/find">ไล่ดูจากลักษณะต้นแทน</Link>
          </p>
        </div>
      )}
    </section>
  );
}
