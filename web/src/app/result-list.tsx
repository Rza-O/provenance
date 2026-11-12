import type { SearchResult } from "@/lib/search";

// Pure markup: renders whatever search() returned, best match first.
export function ResultList({ results }: { results: SearchResult[] }) {
	return (
		<ol className="mt-8 space-y-6">
			{results.map((r) => (
				<li key={r.id}>
					<a href={r.url} className="text-lg text-blue-700 hover:underline">
						{r.title || r.url}
					</a>
					<div className="truncate text-sm text-green-700">{r.url}</div>
					<p className="mt-1 text-sm text-gray-700">{r.snippet}</p>
				</li>
			))}
		</ol>
	);
}
