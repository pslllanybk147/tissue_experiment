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
    <>
      <h1 className="pl-h1">ค้นหาคู่มือ</h1>
      <form method="get" action="/search" style={{ margin: "18px 0 24px", display: "flex", gap: "10px" }}>
        <input
          className="pl-input"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="ชื่อต้น เช่น พิงค์ปริ๊นเซส"
          aria-label="ชื่อต้นที่ต้องการค้นหา"
        />
        <button className="pl-button" type="submit">ค้นหา</button>
      </form>

      {!searched ? (
        <p className="pl-lede">
          ลองพิมพ์ชื่อที่คุณเรียกต้นนั้น จะเป็นชื่อไทยหรือชื่อวิทยาศาสตร์ก็ได้
          ถ้าไม่รู้ชื่อ ใช้ <Link className="pl-link" href="/find">การไล่ดูจากลักษณะต้น</Link> แทนได้
        </p>
      ) : hits.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.title}`}>
              <Link
                className="pl-card pl-link"
                href={hrefOf(hit)}
                style={{ display: "block", color: "inherit", textDecoration: "none" }}
              >
                <p className="pl-h2">{hit.title}</p>
                <p className="pl-meta" style={{ fontStyle: "italic", marginTop: "2px" }}>{hit.subtitle}</p>
                <p className="pl-lede" style={{ marginTop: "8px" }}>{kindNote[hit.kind]}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="pl-card" style={{ background: "var(--pl-sunk)" }}>
          <p className="pl-h2">ยังไม่มีคู่มือของต้นนี้</p>
          <p className="pl-lede" style={{ marginTop: "8px" }}>
            เราไม่เดาให้ เพราะตำแหน่งตัดของแต่ละทรงต่างกันจริง ๆ และตัดผิดตำแหน่งต้นจะไม่ขึ้น
            แต่ถ้าคุณบอกลักษณะต้นได้ เราหาทรงให้ได้
          </p>
          <p style={{ marginTop: "14px" }}>
            <Link className="pl-link" href="/find">ไล่ดูจากลักษณะต้นแทน</Link>
          </p>
        </div>
      )}
    </>
  );
}
