import { decodeHTML, decodeHTMLAttribute } from "entities";

export type Extracted = { title: string; text: string; links: string[] };

export async function extract(html: string): Promise<Extracted> {
	let title = "";
	let text = "";
	let skip = false;
	let inSvgTitle = false;
	const links: string[] = [];

	const rewriter = new HTMLRewriter()
		.on("svg title", {
			element(el) {
				inSvgTitle = true;
				el.onEndTag(() => {
					inSvgTitle = false;
				});
			},
		})
		.on("title", {
			text(chunk) {
				if (!inSvgTitle) title += chunk.text;
			},
		})
		.on("script, style, noscript", {
			element(el) {
				skip = true;
				el.onEndTag(() => {
					skip = false;
				});
			},
		})
		.on("body", {
			text(chunk) {
				if (skip || inSvgTitle) return;
				text += chunk.text;
				if (chunk.lastInTextNode) text += " ";
			},
		})
		.on("a[href]", {
			element(el) {
				const href = el.getAttribute("href");
				if (href) links.push(decodeHTMLAttribute(href));
			},
		});

	await rewriter.transform(new Response(html)).text();

	return {
		title: decodeHTML(title).replace(/\s+/g, " ").trim(),
		text: decodeHTML(text).replace(/\s+/g, " ").trim(),
		links,
	};
}
