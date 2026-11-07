import { TRACKING_PARAMS } from "./config";

export function normalize(raw: string, base?: string): string | null {
	try {
		const url = new URL(raw, base);
		if (url.protocol !== "https:" && url.protocol !== "http:") return null;

		url.hash = "";
		for (const key of [...url.searchParams.keys()]) {
			if (TRACKING_PARAMS.test(key)) {
				url.searchParams.delete(key);
			}
		}
		url.searchParams.sort();
		return url.toString();
	} catch {
		return null;
	}
}
