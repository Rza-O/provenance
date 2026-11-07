import { extract } from "./extract";
import { fetchPage } from "./fetch";
import { makeFrontier } from "./frontier";
import { normalize } from "./normalize";
import { canFetch } from "./robots";
import { loadSeeds, makeAllowList } from "./seed";

const seeds = await loadSeeds();
const isAllowed = makeAllowList(seeds);
const frontier = makeFrontier();

for (const seed of seeds) frontier.add(seed);
console.log(`loaded ${seeds.length} seeds`);

let crawled = 0;
let url: string | undefined;

while ((url = frontier.next())) {
	if (!(await canFetch(url))) {
		console.log(`BLOCKED ${url}`);
		continue;
	}

	const page = await fetchPage(url);
	if (!page || !page.html) continue;

	frontier.markSeen(page.url);
	const { title, text, links } = await extract(page.html);
	crawled++;
	console.log(`${crawled}  ${page.status}  ${text.length} chars  ${title}  ${page.url}`);

	for (const link of links) {
		const abs = normalize(link, page.url);
		if (abs && isAllowed(abs)) frontier.add(abs);
	}
}
console.log(`done: ${crawled} pages`);
