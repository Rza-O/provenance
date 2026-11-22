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

	test("ignores <title> inside SVG", async () => {
		const page = await extract(
			"<head><title>The Fly Blog</title></head><body><svg><title>Fly</title></svg><p>Hi</p></body>",
		);
		expect(page.title).toBe("The Fly Blog");
		expect(page.text).toBe("Hi");
	});

	test("decodes entities, once", async () => {
		const page = await extract("<body><p>doesn&#39;t use &amp;lt;&nbsp;here</p></body>");
		expect(page.text).toBe("doesn't use &lt; here");
	});

	test("decodes hrefs", async () => {
		const page = await extract('<body><a href="/s?a=1&amp;b=2&copy=3">x</a></body>');
		expect(page.links).toEqual(["/s?a=1&b=2&copy=3"]);
	});
});
