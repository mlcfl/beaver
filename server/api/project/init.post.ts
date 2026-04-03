import { access, copyFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { getRootPath } from "../../utils";

/**
 * Copies all files from templates/root to the project root if they don't exist.
 * Required for a fresh setup where only beaver/ is present.
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	const templatesPath = join(rootPath, "beaver", "templates", "root");

	const files = await readdir(templatesPath);

	for (const file of files) {
		const dest = join(rootPath, file);
		try {
			await access(dest, constants.F_OK);
		} catch {
			await copyFile(join(templatesPath, file), dest);
		}
	}
});
