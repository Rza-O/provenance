import { describe, expect, test } from "bun:test";
import { tokenize } from "../src/tokenize";

describe("tokenize", () => {
	test("lowercases and drops punctuation", () => {
		expect(tokenize("Running Docker Compose!")).toEqual(["running", "docker", "compose"]);
	});

	test("splits dotted and hyphenated names", () => {
		expect(tokenize("node.js docker-compose")).toEqual(["node", "js", "docker", "compose"]);
	});

	test("keeps numbers", () => {
		expect(tokenize("HTTP/2 on port 5432")).toEqual(["http", "2", "on", "port", "5432"]);
	});

	test("returns [] when there are no words", () => {
		expect(tokenize("")).toEqual([]);
		expect(tokenize("!!! ...")).toEqual([]);
	});
	test("drops symbols, so C++ and C# both become c (known limitation)", () => {
		expect(tokenize("C++ and C#")).toEqual(["c++", "and", "c#"]);
	});
	test("strips plurals (Porter step 1a)", () => {
		expect(tokenize("caresses ponies caress cats boss")).toEqual([
			"caress",
			"poni",
			"caress",
			"cat",
			"boss",
		]);
	});
	test("leaves short words alone", () => {
		expect(tokenize("js is was")).toEqual(["js", "is", "was"]);
	});
});
