"use client";

import { useSearchParams } from "next/navigation";

export function SearchBox() {
	const q = useSearchParams().get("q") ?? "";
	return (
		<input
			key={q}
			name="q"
			defaultValue={q}
			placeholder="Search docs, e.g. docker compose"
			className="flex-1 rounded border border-gray-300 px-3 py-2"
		/>
	);
}
