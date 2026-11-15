import type { Index } from "./build";
import { tokenize } from "./tokenize";

// Elasticsearch/Lucene defaults. K1: how fast repeats stop helping. B: how much page length counts (0 = ignore, 1 = full).
const K1 = 1.2;
const B = 0.75;

function avgDocLength(index: Index): number {
	let total = 0;
	for (const len of index.docLengths.values()) total += len;
	return total / index.docLengths.size;
}

// Lucene's IDF: rare words weigh more; the `1 +` keeps it positive even for a word on every page.
function idf(index: Index, term: string): number {
	const N = index.docLengths.size;
	const df = index.postings.get(term)?.length ?? 0;
	return Math.log(1 + (N - df + 0.5) / (df + 0.5));
}

// Repeats saturate toward K1 + 1; longer-than-average pages are scaled down. Average page, tf = 1 → 1.0.
function tfPart(tf: number, docLen: number, avgdl: number): number {
	return (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (docLen / avgdl)));
}

export function bm25(index: Index, query: string): { docId: number; score: number }[] {
	const avgdl = avgDocLength(index);
	// Accumulators (IIR 7.1): docId → running score; only matching pages get an entry.
	const scores = new Map<number, number>();

	// Same tokenizer as the pages, so "Containers" meets the stored "container".
	for (const term of tokenize(query)) {
		const weight = idf(index, term);
		for (const { docId, tf } of index.postings.get(term) ?? []) {
			const docLen = index.docLengths.get(docId)!;
			// One term's BM25 share for this page; pages matching more terms collect more.
			const points = weight * tfPart(tf, docLen, avgdl);
			scores.set(docId, (scores.get(docId) ?? 0) + points);
		}
	}

	return [...scores].map(([docId, score]) => ({ docId, score })).sort((x, y) => y.score - x.score);
}
