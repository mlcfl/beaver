import { cwd } from "node:process";
import { join } from "node:path";
import { spawn } from "node:child_process";

/**
 * Run frontend or backend for selected apps
 * Now only supports running one app at a time
 */
export default defineEventHandler(async (event) => {
	const { apps: selectedApps, part } = await readBody<{
		apps: string[];
		part: "frontend" | "backend";
	}>(event);
	const [selectedAppId] = selectedApps;

	if (!selectedAppId) {
		throw createError({
			statusCode: 400,
			statusMessage: "No app selected",
		});
	}

	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");
	const frontendPath = join(
		appsPath,
		selectedAppId,
		`${selectedAppId}-${part}`
	);
	const port = part === "frontend" ? 7100 : 7200;

	spawn("pnpm", ["dev", `--port=${port}`], {
		cwd: frontendPath,
		stdio: "ignore",
	});

	return { port };
});
