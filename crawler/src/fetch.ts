import { FETCH_TIMEOUT_MS, USER_AGENT } from "./config";
import { waitTurn } from "./limiter";

export type FetchResult = {
	url: string;
	status: number;
	contentType: string;
	html: string;
};

export async function fetchPage(url: string): Promise<FetchResult | null> {
	try {
		await waitTurn(new URL(url).hostname);
		const res = await fetch(url, {
			headers: { "User-Agent": USER_AGENT },
			signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			redirect: "follow",
		});

		const contentType = res.headers.get("content-type") ?? "";
		if (!res.ok || !contentType.includes("text/html")) {
			return { url: res.url, status: res.status, contentType, html: "" };
		}

		return { url: res.url, status: res.status, contentType, html: await res.text() };
	} catch (err) {
		console.error(`fetch failed: ${url}`, (err as Error).message);
		return null;
	}
}
