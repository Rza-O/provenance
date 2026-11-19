import { getIndex, search } from "./query";

await getIndex();

const server = Bun.serve({
	port: Number(process.env.SEARCH_PORT ?? 4000),
	routes: {
		"/search": async (req) => {
			const q = new URL(req.url).searchParams.get("q") ?? "";
			return Response.json(await search(q));
		},
	},
	fetch() {
		return new Response("Not Found!", { status: 404 });
	},
});

console.log(`search service on ${server.url}`);
