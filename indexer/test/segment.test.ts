import { expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIndex } from "../src/build";
import { mkdtemp } from "node:fs/promises";
import { combine, listSegments, mergeSegments, readSegment, writeSegment } from "../src/segment";

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

test("combine joins postings older first and keeps every page", () => {
	const older = buildIndex([
		{ id: 1, text: "docker compose" },
		{ id: 2, text: "docker build" },
	]);
	const newer = buildIndex([{ id: 3, text: "docker swarm" }]);
	const both = combine(older, newer);
	// In both → old ids then new, still sorted; in one only → kept as is.
	expect(both.postings.get("docker")?.map((p) => p.docId)).toEqual([1, 2, 3]);
	expect(both.postings.get("compose")?.map((p) => p.docId)).toEqual([1]);
	expect(both.postings.get("swarm")?.map((p) => p.docId)).toEqual([3]);
	expect(both.docLengths.size).toBe(3);
});

test("combine leaves the older index unchanged", () => {
	const older = buildIndex([{ id: 1, text: "docker" }]);
	const newer = buildIndex([{ id: 2, text: "docker" }]);
	combine(older, newer);
	// Would be 2 if combine pushed into older's array instead of building a new one.
	expect(older.postings.get("docker")?.length).toBe(1);
});

test("mergeSegments leaves one file with every page", async () => {
	const dir = await mkdtemp(join(tmpdir(), "seg-merge-"));
	const a = join(dir, "seg-0001.json");
	const b = join(dir, "seg-0002.json");
	const out = join(dir, "seg-0003.json");
	await writeSegment(buildIndex([{ id: 1, text: "docker compose" }]), a);
	await writeSegment(buildIndex([{ id: 2, text: "docker swarm" }]), b);

	await mergeSegments(a, b, out);

	// Only the merged file is left: proves both inputs were deleted (after the write).
	expect(await listSegments(dir)).toEqual([out]);
	const merged = await readSegment(out);
	expect(merged.postings.get("docker")?.map((p) => p.docId)).toEqual([1, 2]);
	expect(merged.docLengths.size).toBe(2);
});
