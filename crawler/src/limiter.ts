import { CRAWL_DELAY_MS } from "./config";

const lastHit = new Map<string, number>();
export async function waitTurn(host: string): Promise<void> {
	const last = lastHit.get(host) ?? 0;
	const wait = last + CRAWL_DELAY_MS - Date.now();

	if (wait > 0) await Bun.sleep(wait);

	lastHit.set(host, Date.now());
}
