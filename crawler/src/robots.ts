import { FETCH_TIMEOUT_MS, USER_AGENT } from "./config";
import { waitTurn } from "./limiter";

export async function fetchRobots(host: string): Promise<string> {
	await waitTurn(host);
	const res = await fetch(`https://${host}/robots.txt`, {
		headers: { "User-Agent": USER_AGENT },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	});

	if (!res.ok) return "";
	return await res.text();
}

export function parseRobots(text: string): string[] {
	const disallow: string[] = [];
	let applies = false;
	let lastWasAgent = false;

	for (const raw of text.split(/\r?\n/)) {
		const line = (raw.split("#")[0] ?? "").trim();
		if (!line) continue;

		const colon = line.indexOf(":");
		if (colon === -1) continue;

		const key = line.slice(0, colon).trim().toLowerCase();
		const value = line.slice(colon + 1).trim();

		if (key === "user-agent") {
			const matches = value === "*" || value.toLowerCase().includes("provenancebot");
			applies = lastWasAgent ? applies || matches : matches;
			lastWasAgent = true;
		} else {
			lastWasAgent = false;
			if (key === "disallow" && applies && value) {
				disallow.push(value);
			}
		}
	}
	return disallow;
}

const cache = new Map<string, string[]>();

export async function canFetch(url: string): Promise<boolean> {
	const { hostname, pathname } = new URL(url);

	let rules = cache.get(hostname);
	if (rules === undefined) {
		rules = parseRobots(await fetchRobots(hostname));
		cache.set(hostname, rules);
	}
	return !rules.some((rule) => pathname.startsWith(rule));
}
