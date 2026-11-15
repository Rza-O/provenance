import { join } from "node:path";
import { buildIndex } from "./build";
import { sql } from "./db";
import { listSegments, readSegment, writeSegment } from "./segment";

type Row = { id: string; title: string; body: string };

const DIR = "data/segments";
const segments = await listSegments(DIR);

// Highest page id already in a segment; 0 = no segments yet, so every page is new.
let maxId = 0;
for (const path of segments) {
	const { docLengths } = await readSegment(path);
	for (const id of docLengths.keys()) maxId = Math.max(maxId, id);
}
console.log("highest id on disk:", maxId);

// Only pages newer than the segments (IIR 4.5's auxiliary index). ORDER BY id keeps postings sorted.
const rows: Row[] = await sql`SELECT id, title, body FROM pages WHERE id > ${maxId} ORDER BY id`;

if (rows.length === 0) {
	console.log(`no new pages after id ${maxId}`);
	process.exit(0);
}

// BIGINT ids arrive as strings, hence Number(). Title and body share one field for now (BM25F later).
const docs = rows.map((r) => ({ id: Number(r.id), text: `${r.title} ${r.body}` }));

const index = buildIndex(docs);

// Next number = newest + 1, not segments.length + 1: merges delete files, so the count can shrink and collide.
const last = segments.at(-1);
const n = last ? Number(last.match(/seg-(\d+)\.json$/)?.[1]) + 1 : 1;
const path = join(DIR, `seg-${String(n).padStart(4, "0")}.json`);
await writeSegment(index, path);
console.log(`wrote ${path}: ${docs.length} pages, ${index.postings.size} terms`);
