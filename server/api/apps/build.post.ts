import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";

/**
 * Build all parts of the selected applications
 */
export default defineEventHandler(async (event) => {
	const selectedApps = await readBody<string[]>(event);
	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");
	const applicationParts = ["shared", "frontend", "backend"] as const;

	for (const appId of selectedApps) {
		for (const part of applicationParts) {
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
