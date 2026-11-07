import { test, expect } from "bun:test";
import { makeFrontier } from "../src/frontier";

test("deadups the same page", () => {
	const f = makeFrontier();
	expect(f.add("https://bun.sh/docs")).toBe(true);
	expect(f.add("https://bun.sh/docs#intro")).toBe(false);
});

test("caps pages per host", () => {
	const f = makeFrontier();
	for (let i = 0; i < 10; i++) {
		f.add(`https://go.dev/p${i}`);
	}

	expect(f.add("https://go.dev/p10")).toBe(false);
	expect(f.add("https://bun.sh/x")).toBe(true);
});
