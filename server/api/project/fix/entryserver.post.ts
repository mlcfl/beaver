import { cwd } from "node:process";
import { join } from "node:path";
import { copyFile } from "node:fs/promises";
import { $ } from "execa";

/**
 * Clones "entry-server" from GitHub and install it
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = join(cwd(), "../");

	// Clone from GitHub
	await $({
		cwd: rootPath,
	})`git clone https://github.com/mlcfl/entry-server.git`;

	// Add .env files for development and production
	const rootEntryServerPath = join(rootPath, "entry-server");
	await copyFile(
		join(rootEntryServerPath, ".env.example"),
		join(rootEntryServerPath, ".env.development")
	);
	await copyFile(
		join(rootEntryServerPath, ".env.example"),
		join(rootEntryServerPath, ".env.production")
	);

	// Install deps
	await $({
		cwd: join(rootPath, "entry-server"),
	})`pnpm install --frozen-lockfile`;
});
