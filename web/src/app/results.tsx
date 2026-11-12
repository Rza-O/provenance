import { search } from "@/lib/search";
import { ResultList } from "./result-list";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export async function Results({ searchParams }: Props) {
	const { q } = await searchParams;
	// ?q=a&q=b arrives as an array and a missing ?q as undefined; only a plain string is searched.
	const query = typeof q === "string" ? q : "";
	if (query.trim() === "") return null;

	const results = await search(query);
	if (results.length === 0) {
		return <p className="mt-8 text-gray-500">No results for “{query}”.</p>;
	}
	return <ResultList results={results} />;
}
