import { expect, test } from "bun:test";
import { buildIndex } from "../src/build";

// IIR Exercise 1.1: small enough to check every answer by hand.
const docs = [
	{ id: 1, text: "new home sales top forecasts" },
	{ id: 2, text: "home sales rise in july" },
	{ id: 3, text: "increase in home sales in july" },
	{ id: 4, text: "july new home sales rise" },
];

const index = buildIndex(docs);

// Visual dump: one line per term, postings as doc:tf pairs.
console.log("\n--- postings (term → doc:tf) ---");
for (const [term, list] of [...index.postings].sort(([a], [b]) => a.localeCompare(b))) {
	console.log(term.padEnd(10), list.map((p) => `${p.docId}:${p.tf}`).join("  "));
}
console.log("\n--- doc lengths (doc → tokens) ---");
console.log(Object.fromEntries(index.docLengths), "\n");

const docIds = (term: string) => index.postings.get(term)?.map((p) => p.docId);

test("postings list every doc containing the term, in id order", () => {
	expect(docIds("home")).toEqual([1, 2, 3, 4]);
	expect(docIds("july")).toEqual([2, 3, 4]);
	expect(docIds("forecast")).toEqual([1]);
});

test("terms are stored stemmed, matching the tokenizer", () => {
	expect(docIds("sale")).toEqual([1, 2, 3, 4]);
	expect(index.postings.has("sales")).toBe(false);
});

test("tf counts repeats within one doc, one posting per (term, doc)", () => {
	expect(index.postings.get("in")).toEqual([
		{ docId: 2, tf: 1 },
		{ docId: 3, tf: 2 },
	]);
});

test("doc lengths count tokens", () => {
	expect(index.docLengths.get(1)).toBe(5);
	expect(index.docLengths.get(3)).toBe(6);
});

test("unknown term has no postings", () => {
	expect(index.postings.get("docker")).toBeUndefined();
});
