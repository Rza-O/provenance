import { expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "../src/build";
import { readSegment, writeSegment } from "../src/segment";

test("a segment reads back exactly what was written", async () => {
	const index = buildIndex([
		{ id: 1, text: "docker compose up" },
		{ id: 2, text: "docker build" },
	]);
	const path = join(tmpdir(), `seg-test-${Date.now()}.json`);
	await writeSegment(index, path);
	// Deep equality on both Maps; it ignores Map order, so the next test checks order.
	expect(await readSegment(path)).toEqual(index);
});

test("terms come back sorted", async () => {
	// buildIndex sees "zebra" first; the segment must still store a → z (the SSTable rule).
	const index = buildIndex([{ id: 1, text: "zebra apple mango" }]);
	const path = join(tmpdir(), `seg-sort-${Date.now()}.json`);
	await writeSegment(index, path);
	const back = await readSegment(path);
	expect([...back.postings.keys()]).toEqual(["apple", "mango", "zebra"]);
});
