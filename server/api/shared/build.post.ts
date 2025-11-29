import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { $ } from "execa";
import { getRootPath } from "../../utils";

/**
 * Build shared module
 */
export default defineEventHandler(async (event) => {
	const sharedPart = await readBody<"all" | "frontend" | "backend">(event);
	const rootPath = getRootPath();
	const partRoot = join(rootPath, "shared", `shared-${sharedPart}`);

	await access(partRoot, constants.F_OK);
	await $({ cwd: partRoot })`pnpm build`;
});
