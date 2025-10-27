import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";

/**
 * Link shared parts together
 */
export default defineEventHandler(async (event) => {
	const selectedApps = await readBody<string[]>(event);
	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");
	const applicationParts = ["shared", "backend", "frontend"] as const;

	for (const appId of selectedApps) {
		let sharedLocalExists = false;

		for (const part of applicationParts) {
			try {
				const partRoot = join(appsPath, appId, `${appId}-${part}`);
				await access(partRoot, constants.F_OK);

				if (part === "shared") {
					sharedLocalExists = true;
				}

				// Shared all for each part
				await $({ cwd: partRoot })`pnpm link ../../../shared/shared-all`;

				// Shared backend for backend
				if (part === "backend") {
					await $({ cwd: partRoot })`pnpm link ../../../shared/shared-backend`;
				}

				// Shared frontend for frontend
				if (part === "frontend") {
					await $({ cwd: partRoot })`pnpm link ../../../shared/shared-frontend`;
				}

				// Shared local for backend and frontend
				if (part !== "shared" && sharedLocalExists) {
					await $({ cwd: partRoot })`pnpm link ../${appId}-shared`;
				}
			} catch {
				continue;
			}
		}
	}
});
