import { expect, test } from "bun:test";
import { intersect } from "../src/intersect";

const postings = (ids: number[]) => ids.map((docId) => ({ docId, tf: 1 }));

test("IIR Figure 1.5: Brutus AND Calpurnia", () => {
	const brutus = postings([1, 2, 4, 11, 31, 45, 173, 174]);
	const calpurnia = postings([2, 31, 54, 101]);
	expect(intersect(brutus, calpurnia)).toEqual([2, 31]);
});

test("no shared docs gives an empty list", () => {
	expect(intersect(postings([1, 3, 5]), postings([2, 4, 6]))).toEqual([]);
});

test("an unknown term (empty list) matches nothing", () => {
	expect(intersect(postings([1, 2, 3]), [])).toEqual([]);
});
