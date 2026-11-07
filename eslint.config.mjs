import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default defineConfig(
	{ ignores: ["**/node_modules/**", "notes/**", "books/**", "web/**"] },
	js.configs.recommended,
	tseslint.configs.recommended,
	prettier,
);
