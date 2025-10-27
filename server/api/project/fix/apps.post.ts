import { mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";

/**
 * Creates /apps directory
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");

	try {
		await access(appsPath, constants.F_OK);
	} catch {
		await mkdir(appsPath);
	}
});
