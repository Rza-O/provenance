import { SQL } from "bun";

// Own connection, not the crawler's: workspaces stay independent (they become separate services in Week 3).
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (run from the repo root)");
export const sql = new SQL(url);
