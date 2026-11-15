import { buildIndex } from "./build";
import { sql } from "./db";
import { writeSegment } from "./segment";

type Row = { id: string; title: string; body: string };

// ORDER BY id keeps postings sorted; BIGINT ids arrive as strings, hence Number().
const rows: Row[] = await sql`SELECT id, title, body FROM pages ORDER BY id`;
// Title and body share one field for now; a title boost can come later (BM25F).
const docs = rows.map((r) => ({ id: Number(r.id), text: `${r.title} ${r.body}` }));

const index = buildIndex(docs);

const path = "data/segments/seg-0001.json";
await writeSegment(index, path);
console.log(`wrote ${path}: ${docs.length} pages, ${index.postings.size} terms`);
