import { canFetch, fetchRobots, parseRobots } from "./robots";
import { loadSeeds, makeAllowList } from "./seed";

const seeds = await loadSeeds();
const isAllowed = makeAllowList(seeds);

console.log(`loaded ${seeds.length} seeds`);

for (const url of seeds) {
	if (!isAllowed(url)) continue;

	const ok = await canFetch(url);
	console.log(`${ok ? "OK    " : "BLOCKED"}${url}`);
}
