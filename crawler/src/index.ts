import { loadSeeds, makeAllowList } from "./seed";

const seeds = await loadSeeds();
const isAllowed = makeAllowList(seeds);

console.log(`loaded ${seeds.length} seeds`);
console.log(isAllowed("https://react.dev/reference/react"));
console.log(isAllowed("https://google.com/"));
