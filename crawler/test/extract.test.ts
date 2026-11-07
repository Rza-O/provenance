import { describe, test, expect } from "bun:test";
import { extract } from "../src/extract";

const html = `
<html>
  <head><title>Bun Docs</title></head>
  <body>
    <h1>Install</h1>
    <script>track()</script>
    <p>Run <a href="/docs/install">this</a></p>
  </body>
</html>`;

describe("extract", () => {
	test("gets the title", async () => {
		const page = await extract(html);
		expect(page.title).toBe("Bun Docs");
	});

	test("gets body text without script, words separated", async () => {
		const page = await extract(html);
		expect(page.text).toBe("Install Run this");
	});

	test("collects raw hrefs", async () => {
		const page = await extract(html);
		expect(page.links).toEqual(["/docs/install"]);
	});
});
