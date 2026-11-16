import { join } from "node:path";
import { buildIndex } from "./build";
import { sql } from "./db";
import { listSegments, mergeSegments, readSegment, writeSegment } from "./segment";

type Row = { id: string; title: string; body: string };

const DIR = "data/segments";
// Merge policy: once there are more segments than this, merge (IIR 4.5, Lucene merge policy).
const MAX_SEGMENTS = 1;

// Next number = newest + 1, not paths.length + 1: merges delete files, so the count can shrink and collide.
function nextSegmentPath(paths: string[]): string {
	const last = paths.at(-1);
	const n = last ? Number(last.match(/seg-(\d+)\.json$/)?.[1]) + 1 : 1;
	return join(DIR, `seg-${String(n).padStart(4, "0")}.json`);
}

const segments = await listSegments(DIR);

// Highest page id already in a segment; 0 = no segments yet, so every page is new.
let maxId = 0;
for (const path of segments) {
	const { docLengths } = await readSegment(path);
	for (const id of docLengths.keys()) maxId = Math.max(maxId, id);
}
console.log("highest id on disk:", maxId);

// Only pages newer than the segments (IIR 4.5's auxiliary index). ORDER BY id keeps postings sorted.
const rows: Row[] = await sql`SELECT id, title, body FROM pages WHERE id > ${maxId}  ORDER BY id`;

if (rows.length === 0) {
	console.log(`no new pages after id ${maxId}`);
	process.exit(0);
}

// BIGINT ids arrive as strings, hence Number(). Title and body share one field for now (BM25F later).
const docs = rows.map((r) => ({ id: Number(r.id), text: `${r.title} ${r.body}` }));

const index = buildIndex(docs);

const path = nextSegmentPath(segments);
await writeSegment(index, path);
console.log(`wrote ${path}: ${docs.length} pages, ${index.postings.size} terms`);

let all = await listSegments(DIR);
while (all.length > MAX_SEGMENTS) {
	const [older, newer] = all.slice(-2);
	if (!older || !newer) break;

	const out = nextSegmentPath(all);
	await mergeSegments(older, newer, out);
	console.log(`merged ${older} + ${newer} -> ${out}`);
	all = await listSegments(DIR);
}
