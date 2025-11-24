import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";

/**
 * Install dependencies for selected apps
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
				// Check if the root directory exists
				await access(partRoot, constants.F_OK);

				// Check if node_modules already exists
				try {
					await access(join(partRoot, "node_modules"), constants.F_OK);
				} catch {
					// Install dependencies if node_modules does not exist
					await $({ cwd: partRoot })`pnpm install --frozen-lockfile`;
				}
			} catch {
				continue;
			}
		}
	}
});
