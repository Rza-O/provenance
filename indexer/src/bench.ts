import { bm25 } from "./bm25";
import { sql } from "./db";
import { loadIndex } from "./segment";

const QUERIES = [
	"redis",
	"sqlite",
	"kubernetes",
	"docker compose",
	"react state",
	"typescript generics",
	"rate limiting",
	"how to write a dockerfile",
	"why is my postgres query slow",
	"how do distributed systems fail",
];

const RUNS = 20;

function median(times: number[]): number {
	const sorted = [...times].sort((a, b) => a - b);
	return sorted[Math.floor(sorted.length / 2)]!;
}

function overlap(mine: number[], theirs: number[]): string {
	if (theirs.length === 0) return "n/a";
	const inTheirs = new Set(theirs);
	const shared = mine.filter((id) => inTheirs.has(id)).length;
	return `${shared}/${Math.min(mine.length, theirs.length)}`;
}

async function pgSearch(q: string, mode: "and" | "or"): Promise<number[]> {
	const text = mode == "or" ? q.split(/\s+/).join(" or ") : q;
	const rows: { id: string }[] = await sql`
      SELECT id FROM pages, websearch_to_tsquery('english', ${text}) AS query
      WHERE tsv @@ query
      ORDER BY ts_rank(tsv, query) DESC
      LIMIT 10;
   `;
	return rows.map((r) => Number(r.id));
}

async function pgMedian(q: string, mode: "and" | "or"): Promise<number> {
	await pgSearch(q, mode);
	const times: number[] = [];
	for (let i = 0; i < RUNS; i++) {
		const start = performance.now();
		await pgSearch(q, mode);
		times.push(performance.now() - start);
	}
	return median(times);
}

async function pgRoundTrip(): Promise<number> {
	await sql`SELECT 1`;
	const times: number[] = [];
	for (let i = 0; i < RUNS; i++) {
		const start = performance.now();
		await sql`SELECT 1`;
		times.push(performance.now() - start);
	}
	return median(times);
}

const index = await loadIndex("data/segments");
const table: Record<string, string>[] = [];

for (const q of QUERIES) {
	bm25(index, q);
	const times: number[] = [];
	for (let i = 0; i < RUNS; i++) {
		const start = performance.now();
		bm25(index, q);
		times.push(performance.now() - start);
	}
	const mine = bm25(index, q)
		.slice(0, 10)
		.map((r) => r.docId);
	const and = await pgSearch(q, "and");
	const or = await pgSearch(q, "or");

	table.push({
		query: q,
		"mine ms": median(times).toFixed(3),
		"pg AND ms": (await pgMedian(q, "and")).toFixed(3),
		"pg OR ms": (await pgMedian(q, "or")).toFixed(3),
		"overlap AND": overlap(mine, and),
		"overlap OR": overlap(mine, or),
	});
}

console.table(table);
console.log("postgres round trip (SELECT 1):", (await pgRoundTrip()).toFixed(3), "ms");
