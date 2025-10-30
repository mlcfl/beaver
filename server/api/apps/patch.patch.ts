import { access, cp } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";

type Body = {
	apps: string[];
	part: "all" | "shared" | "frontend" | "backend";
};

/**
 * Patch selected apps
 * Copy all files and directories from template part to application part, overwrite existing
 */
export default defineEventHandler(async (event) => {
	const { apps, part } = await readBody<Body>(event);
	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");
	const templatesPath = join(cwd(), "/templates/apps");
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
			} catch {
				continue;
			}
		}
	}
});
