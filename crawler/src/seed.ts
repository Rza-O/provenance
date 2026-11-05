const path = `${import.meta.dir}/../seed.txt`;

export async function loadSeeds(): Promise<string[]> {
	const text = await Bun.file(path).text();
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
}

export function makeAllowList(urls: string[]) {
	const allowedHosts = new Set(urls.map((u) => new URL(u).hostname));

	return function isAllowed(url: string): boolean {
		try {
			const host = new URL(url).hostname;
			return allowedHosts.has(host);
		} catch {
			return false;
		}
	};
}
