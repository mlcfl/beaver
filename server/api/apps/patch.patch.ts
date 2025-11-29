import { access, cp, rename, glob } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { getRootPath } from "../../utils";

type Body = {
	apps: string[];
	part: "all" | "shared" | "frontend" | "backend";
};

/**
 * Find and rename .ts.txt files to .ts
 */
const renameTsTxtFiles = async (dir: string): Promise<void> => {
	const pattern = join(dir, "**/*.ts.txt");

	for await (const file of glob(pattern)) {
		const newPath = file.slice(0, -4);
		await rename(file, newPath);
	}
};

/**
 * Patch selected apps
 * Copy all files and directories from template part to application part, overwrite existing
 */
export default defineEventHandler(async (event) => {
	const { apps, part } = await readBody<Body>(event);
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "/apps");
	const templatesPath = join(rootPath, "/templates/apps");
	const partsToPatch =
		part === "all" ? ["shared", "frontend", "backend"] : [part];

	for (const appId of apps) {
		for (const part of partsToPatch) {
			const templatePartPath = join(templatesPath, part);
			const appPartPath = join(appsPath, appId, `${appId}-${part}`);

			try {
				await access(templatePartPath, constants.F_OK);
				await access(appPartPath, constants.F_OK);

				await cp(templatePartPath, appPartPath, {
					recursive: true,
					force: true,
				});

				// Rename .ts.txt files to .ts
				await renameTsTxtFiles(appPartPath);
			} catch {
				continue;
			}
		}
	}
});
