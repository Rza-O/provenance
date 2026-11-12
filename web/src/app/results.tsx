import { search } from "@/lib/search";
import { ResultList } from "./result-list";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export async function Results({ searchParams }: Props) {
	const { q } = await searchParams;
	// ?q=a&q=b arrives as an array and a missing ?q as undefined; only a plain string is searched.
	const query = typeof q === "string" ? q : "";
	if (query.trim() === "") return null;

	// Times the DB round-trip. The count is what's shown (capped by LIMIT), not every match.
	const start = performance.now();
	const results = await search(query);
	const ms = Math.round(performance.now() - start);
	if (results.length === 0) {
		return (
			<p className="mt-8 text-gray-500">
				No results for “{query}” ({ms} ms).
			</p>
		);
	}
	return (
		<>
			<p className="mt-6 text-sm text-gray-500">
				{results.length} result{results.length === 1 ? "" : "s"} in {ms} ms
			</p>
			<ResultList results={results} />
		</>
	);
}
