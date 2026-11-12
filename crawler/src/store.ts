import { sql } from "./db";

export type PageToSave = {
	url: string;
	status: number;
	title: string;
	body: string;
	links: string[];
};

export async function savePage(page: PageToSave): Promise<void> {
	const host = new URL(page.url).hostname;
	const links = [...new Set(page.links)];

	await sql.begin(async (tx) => {
		const [{ id }] = await tx`
         INSERT INTO pages (url, host, status_code,title, body)
         VALUES (${page.url}, ${host}, ${page.status}, ${page.title}, ${page.body})
         ON CONFLICT (url) DO UPDATE SET
               status_code = EXCLUDED.status_code,
               title = EXCLUDED.title,
               body = EXCLUDED.body,
               fetched_at = now()
         RETURNING id
      `;

		await tx`DELETE FROM links WHERE from_page_id = ${id}`;

		if (links.length > 0) {
			const rows = links.map((to_url) => ({ from_page_id: id, to_url }));
			await tx`INSERT INTO links ${tx(rows)} ON CONFLICT DO NOTHING`;
		}
	});
}
