import Form from "next/form";
import { Suspense } from "react";
import { Results } from "./results";

// searchParams is passed down un-awaited, so this shell renders instantly
// and only <Results> waits on the URL and the database.
export default function Home({
	searchParams,
}: {
	searchParams: Promise<{ q?: string | string[] }>;
}) {
	return (
		<main className="mx-auto max-w-2xl px-4 py-10">
			<h1 className="text-3xl font-semibold">Provenance</h1>
			<p className="text-sm text-gray-500">Search engineering knowledge from my own index</p>

			<Form action="/" className="mt-6 flex gap-2">
				<input
					name="q"
					placeholder="Search docs, e.g. docker compose"
					className="flex-1 rounded border border-gray-300 px-3 py-2"
				/>
				<button className="rounded bg-black px-4 py-2 text-white">Search</button>
			</Form>
			<Suspense fallback={<p className="mt-8 text-gray-500">Searching…</p>}>
				<Results searchParams={searchParams} />
			</Suspense>
		</main>
	);
}
