import { mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { getRootPath } from "../../../utils";

/**
 * Creates /apps directory
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "/apps");

	try {
		await access(appsPath, constants.F_OK);
	} catch {
		await mkdir(appsPath);
	}
});
