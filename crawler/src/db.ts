import { SQL } from "bun";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (run from the repo root)");
export const sql = new SQL(url);
