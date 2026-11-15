import type { Index, Posting } from "./build";

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
