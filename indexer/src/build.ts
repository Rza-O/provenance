import { tokenize } from "./tokenize";

export type Posting = {
	docId: number;
	tf: number;
};

export type Index = {
	postings: Map<string, Posting[]>;
	docLengths: Map<number, number>;
};

/** Docs must be in ascending id order: postings lists inherit that order, and intersect() relies on it. */
export function buildIndex(docs: { id: number; text: string }[]): Index {
	const postings = new Map<string, Posting[]>();
	const docLengths = new Map<number, number>();

	for (const doc of docs) {
		const tokens = tokenize(doc.text);
		docLengths.set(doc.id, tokens.length);
		// Count first, so each (term, doc) pair gets exactly one posting.
		const counts = new Map<string, number>();
		for (const t of tokens) {
			counts.set(t, (counts.get(t) ?? 0) + 1);
		}
		for (const [term, tf] of counts) {
			const list = postings.get(term) ?? [];
			list.push({ docId: doc.id, tf });
			postings.set(term, list);
		}
	}

	return { postings, docLengths };
}
