import type { Posting } from "./build";

export function intersect(a: Posting[], b: Posting[]): number[] {
	const answer: number[] = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) {
		const x = a[i]!.docId;
		const y = b[j]!.docId;

		if (x === y) {
			answer.push(x);
			i++;
			j++;
		} else if (x < y) {
			i++;
		} else {
			j++;
		}
	}
	return answer;
}
