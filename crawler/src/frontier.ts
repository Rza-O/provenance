import { MAX_PAGES_PER_HOST, MAX_PAGES_TOTAL } from "./config";
import { normalize } from "./normalize";

export function makeFrontier() {
	const queue: string[] = [];
	const seen = new Set<string>();
	const perHost = new Map<string, number>();

	function add(raw: string, base?: string): boolean {
		const url = normalize(raw, base);
		if (!url || seen.has(url)) return false;
		if (seen.size >= MAX_PAGES_TOTAL) return false;

		const host = new URL(url).hostname;
		const count = perHost.get(host) ?? 0;
		if (count >= MAX_PAGES_PER_HOST) return false;

		seen.add(url);
		perHost.set(host, count + 1);
		queue.push(url);
		return true;
	}

	function next(): string | undefined {
		return queue.shift();
	}

	function markSeen(raw: string): void {
		const url = normalize(raw);
		if (url) seen.add(url);
	}

	return { add, next, markSeen, size: () => queue.length };
}
