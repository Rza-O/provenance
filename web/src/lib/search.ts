export type SearchResult = {
	id: string;
	title: string;
	url: string;
	snippet: string;
	rank: number;
};

const SEARCH_URL = process.env.SEARCH_URL ?? "http://localhost:4000";

export async function search(q: string): Promise<SearchResult[]> {
	const res = await fetch(`${SEARCH_URL}/search?q=${encodeURIComponent(q)}`);
	if (!res.ok) throw new Error(`Search service: ${res.status}`);
	return res.json();
}
