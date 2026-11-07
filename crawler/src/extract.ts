export type Extracted = { title: string; text: string; links: string[] };

export async function extract(html: string): Promise<Extracted> {
	let title = "";
	let text = "";
	let skip = false;
	const links: string[] = [];

	const rewriter = new HTMLRewriter()
		.on("title", {
			text(chunk) {
				title += chunk.text;
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
				if (skip) return;
				text += chunk.text;
				if (chunk.lastInTextNode) text += " ";
			},
		})
		.on("a[href]", {
			element(el) {
				const href = el.getAttribute("href");
				if (href) links.push(href);
			},
		});

	await rewriter.transform(new Response(html)).text();

	return {
		title: title.trim(),
		text: text.replace(/\s+/g, " ").trim(),
		links,
	};
}
