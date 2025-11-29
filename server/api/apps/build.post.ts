import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { $ } from "execa";
import { getRootPath } from "../../utils";

type Body = {
	apps: string[];
	part: "all" | "shared" | "frontend" | "backend";
};

/**
 * Build applications. All parts or specific part
 */
export default defineEventHandler(async (event) => {
	const { apps, part } = await readBody<Body>(event);
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "/apps");
	const partsToBuild =
		part === "all" ? ["shared", "frontend", "backend"] : [part];

	for (const appId of apps) {
		for (const part of partsToBuild) {
			try {
				const partRoot = join(appsPath, appId, `${appId}-${part}`);

				await access(partRoot, constants.F_OK);
				await $({ cwd: partRoot })`pnpm build`;
			} catch {
				continue;
			}
		}
	}
});
