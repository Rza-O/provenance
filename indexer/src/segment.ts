import { readdir, rm } from "node:fs/promises";
import type { Index, Posting } from "./build";
import { join } from "node:path";

// On-disk shape. Maps become [key, value] pairs, because JSON.stringify turns a Map into {}.
type SegmentFile = {
	terms: [string, Posting[]][];
	docLengths: [number, number][];
};

// The flush (DDIA p. 78): in-memory index → one write-once file, terms sorted like an SSTable.
export async function writeSegment(index: Index, path: string): Promise<void> {
	// Plain `<`, not localeCompare: the Day 4 merge compares with `<`, so both must agree on order.
	const terms = [...index.postings].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	const file: SegmentFile = { terms, docLengths: [...index.docLengths] };

	await Bun.write(path, JSON.stringify(file));
}

// The reverse of the flush. The SegmentFile type is trusted, not checked: a hand-edited file won't be caught.
export async function readSegment(path: string): Promise<Index> {
	const file: SegmentFile = await Bun.file(path).json();
	return { postings: new Map(file.terms), docLengths: new Map(file.docLengths) };
}

// Oldest → newest. Zero-padded names (seg-0001) make alphabetical order = number order.
export async function listSegments(dir: string): Promise<string[]> {
	const names = await readdir(dir).catch(() => [] as string[]);
	return names
		.filter((name) => name.endsWith(".json"))
		.sort()
		.map((name) => join(dir, name));
}

// Older's postings first: pages.id only grows, so appending keeps every list sorted. Copies, never mutates.
export function combine(older: Index, newer: Index): Index {
	const postings = new Map(older.postings);
	for (const [term, list] of newer.postings) {
		postings.set(term, [...(postings.get(term) ?? []), ...list]);
	}
	const docLengths = new Map([...older.docLengths, ...newer.docLengths]);
	return { postings, docLengths };
}

export async function mergeSegments(
	olderPath: string,
	newerPath: string,
	outPath: string,
): Promise<void> {
	const merged = combine(await readSegment(olderPath), await readSegment(newerPath));
	// Write the new file BEFORE deleting the old ones: a crash in between leaves duplicates, never data loss.
	await writeSegment(merged, outPath);
	await rm(olderPath);
	await rm(newerPath);
}
