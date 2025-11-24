import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";

/**
 * Build entry server module
 */
export default defineEventHandler(async () => {
	const rootPath = join(cwd(), "../");
	const partRoot = join(rootPath, "entry-server");

	await access(partRoot, constants.F_OK);
	await $({ cwd: partRoot })`pnpm build`;
});
