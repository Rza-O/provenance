import { sql } from "@/lib/db";
import { bm25 } from "@indexer/bm25";
import { loadIndex } from "@indexer/segment";

export type SearchResult = {
	id: string; // BIGINT arrives as a string
	title: string;
	url: string;
	snippet: string;
	rank: number;
};

// Cached as a promise so searches during the first load share it.
// Stale after a re-index until the server restarts.
let indexPromise: ReturnType<typeof loadIndex> | undefined;

function segmentsDir(): string {
	const dir = process.env.SEGMENTS_DIR;
	if (!dir) throw new Error("SEGMENTS_DIR is not set (add it to web/.env.local)");
	return dir;
}

function getIndex() {
	indexPromise ??= loadIndex(segmentsDir());
	return indexPromise;
}

export async function search(q: string, limit = 10): Promise<SearchResult[]> {
	const query = q.trim();
	if (query === "") return [];
	const ranked = bm25(await getIndex(), query).slice(0, limit);
	if (ranked.length === 0) return [];

	const ids = ranked.map((r) => r.docId);

	// BM25 ranks; Postgres only supplies display fields.
	const rows: Omit<SearchResult, "rank">[] = await sql`
		SELECT id, title, url,
		ts_headline('english', body, websearch_to_tsquery('english', ${query}),'StartSel=«, StopSel=», MaxWords=35, MinWords=15, MaxFragments=2') AS snippet
		FROM pages
		WHERE id IN ${sql(ids)}
	`;

	const byId = new Map(rows.map((row) => [Number(row.id), row]));

	// IN returns rows in any order, so rebuild BM25's.
	return ranked.flatMap(({ docId, score }) => {
		const row = byId.get(docId);
		return row ? [{ ...row, rank: score }] : [];
	});
}
