import { expect, test } from "bun:test";
import { buildIndex } from "../src/build";
import { bm25 } from "../src/bm25";

test("a rare word outranks a common one", () => {
	const index = buildIndex([
		{ id: 1, text: "apple banana" },
		{ id: 2, text: "cherry banana" },
		{ id: 3, text: "apple banana" },
		{ id: 4, text: "apple banana" },
	]);
	const results = bm25(index, "apple cherry");
	expect(results[0]!.docId).toBe(2);
});

// Every page has 4 tokens, so only tf changes between them.
test("repeats help, but each extra one helps less (saturation)", () => {
	const index = buildIndex([
		{ id: 1, text: "apple x x x" },
		{ id: 2, text: "apple apple x x" },
		{ id: 3, text: "apple apple apple x" },
		{ id: 4, text: "x x x x" },
	]);
	const scores = new Map(bm25(index, "apple").map((r) => [r.docId, r.score]));
	const one = scores.get(1)!;
	const two = scores.get(2)!;
	const three = scores.get(3)!;

	expect(two).toBeGreaterThan(one);
	expect(three).toBeGreaterThan(two);
	expect(three - two).toBeLessThan(two - one);
});

// Same tf on both pages; only the length differs.
test("a short page outranks a long one with the same matches", () => {
	const index = buildIndex([
		{ id: 1, text: "apple x" },
		{ id: 2, text: "apple x x x x x x x" },
	]);
	const results = bm25(index, "apple");
	expect(results.map((r) => r.docId)).toEqual([1, 2]);
});

test("a page with more of the query words ranks first", () => {
	const index = buildIndex([
		{ id: 1, text: "docker x" },
		{ id: 2, text: "docker compose" },
		{ id: 3, text: "compose x" },
	]);
	expect(bm25(index, "docker compose")[0]!.docId).toBe(2);
});

test("unknown words and an empty query return nothing", () => {
	const index = buildIndex([{ id: 1, text: "apple banana" }]);
	expect(bm25(index, "kiwi")).toEqual([]);
	expect(bm25(index, "")).toEqual([]);
});
