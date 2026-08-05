import { GuideShell } from "@/components/guide/guide-shell";
import { SearchResults } from "@/components/guide/search-results";
import { ThemeToggle } from "@/components/guide/theme-toggle";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = Array.isArray(q) ? (q[0] ?? "") : (q ?? "");

  return (
    <GuideShell action={<ThemeToggle />}>
      <SearchResults query={query} />
    </GuideShell>
  );
}
