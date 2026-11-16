import { bm25 } from "./bm25";
import { sql } from "./db";
import { loadIndex } from "./segment";

const query = process.argv.slice(2).join(" ");
const index = await loadIndex("data/segments");

const start = performance.now();
const results = bm25(index, query).slice(0, 5);
const ms = performance.now() - start;

const ids = results.map((r) => r.docId);
const rows: { id: string; title: string }[] =
	ids.length > 0 ? await sql`SELECT id, title FROM pages WHERE id IN ${sql(ids)}` : [];
const titles = new Map(rows.map((r) => [Number(r.id), r.title]));

for (const { docId, score } of results) {
	console.log(score.toFixed(2), docId, titles.get(docId));
}

console.log(`${results.length} results in ${ms.toFixed(2)} ms`);
