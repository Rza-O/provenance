import { bm25 } from "./bm25";
import { buildIndex } from "./build";
import { sql } from "./db";
import { intersect } from "./intersect";

type Row = { id: string; title: string; body: string };

// ORDER BY id keeps postings sorted; BIGINT ids arrive as strings, hence Number().
const rows: Row[] = await sql`SELECT id, title, body FROM pages ORDER BY id`;
// Title and body share one field for now; a title boost can come later (BM25F).
const docs = rows.map((r) => ({ id: Number(r.id), text: `${r.title} ${r.body}` }));

const index = buildIndex(docs);
// console.log("unique terms: ", index.postings.size);

const hits = intersect(index.postings.get("docker") ?? [], index.postings.get("compose") ?? []);

console.log("docker AND compose:", hits);

const titles = new Map(rows.map((r) => [Number(r.id), r.title]));

for (const { docId, score } of bm25(index, "Node.js").slice(0, 5)) {
	console.log(score.toFixed(2), docId, titles.get(docId));
}
