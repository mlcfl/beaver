import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { $ } from "execa";
import { getRootPath } from "../../utils";

/**
 * Creates production configuration for the entry-server
 */
export default defineEventHandler(async () => {
	const rootPath = getRootPath();
	const partRoot = join(rootPath, "entry-server");

	await access(partRoot, constants.F_OK);
	await $({ cwd: partRoot })`pnpm config:prod`;
});
