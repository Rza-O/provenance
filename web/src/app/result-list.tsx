import type { SearchResult } from "@/lib/search";
import { Snippet } from "./snippet";

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
					{/* Debug line: shows why a result ranks where it does. */}
					<div className="text-xs text-gray-400">
						{new URL(r.url).hostname} · rank {r.rank.toFixed(3)}
					</div>
					<Snippet text={r.snippet} />
				</li>
			))}
		</ol>
	);
}
