import { sql } from "@/lib/db";

// One ranked hit, shaped for the search page.
export type SearchResult = {
	id: string; // BIGINT arrives as a string, so large ids stay exact
	title: string;
	url: string;
	snippet: string;
	rank: number;
};

export async function search(q: string, limit = 10): Promise<SearchResult[]> {
	const query = q.trim();
	// Nothing to search for: skip the database round-trip.
	if (query === "") return [];

	// Rank first, then build snippets for the top rows only: ts_headline re-reads the whole body.
	return await sql`
            SELECT id, title, url, rank, ts_headline('english', body, q, 'StartSel=«, StopSel=», MaxWords=35, MinWords=15, MaxFragments=2') AS snippet
      FROM(
            SELECT id, title, url, body, ts_rank(tsv, q) AS rank, q
            -- websearch_to_tsquery accepts any search-box text without throwing
            FROM pages, websearch_to_tsquery('english', ${query}) AS q
            WHERE tsv @@ q
            ORDER BY rank DESC
            LIMIT ${limit}
         
      ) AS top
      -- a subquery's order isn't guaranteed outside it, so sort again
      ORDER BY rank DESC
   `;
}
