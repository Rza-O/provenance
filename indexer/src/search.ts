import { bm25 } from "./bm25";
import { loadIndex } from "./segment";

const query = process.argv.slice(2).join(" ");
const index = await loadIndex("data/segments");

for (const { docId, score } of bm25(index, query).slice(0, 5)) {
	console.log(score.toFixed(2), docId);
}
