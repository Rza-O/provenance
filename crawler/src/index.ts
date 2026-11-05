import { fetchPage } from "./fetch";
import { canFetch, fetchRobots, parseRobots } from "./robots";
import { loadSeeds, makeAllowList } from "./seed";

const seeds = await loadSeeds();
const isAllowed = makeAllowList(seeds);

console.log(`loaded ${seeds.length} seeds`);

for (const url of seeds) {
	if (!isAllowed(url)) continue;

	const ok = await canFetch(url);
	// console.log(`${ok ? "OK    " : "BLOCKED"}${url}`);
	if (!ok) {
		console.log(`BLOCKED    ${url}`);
		continue;
	}
	const page = await fetchPage(url);
	if (page) {
		console.log(`${new Date().toISOString().slice(11, 23)}  ${page.status} ${page.html.length} bytes  ${page.url}`);
	}
}
