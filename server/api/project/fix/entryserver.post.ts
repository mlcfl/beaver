import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";

/**
 * Clones "entry-server" from GitHub and install it
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = join(cwd(), "../");

	await $({
		cwd: rootPath,
	})`git clone https://github.com/mlcfl/entry-server.git`;
	await $({
		cwd: join(rootPath, "entry-server"),
	})`pnpm install --frozen-lockfile`;
});
