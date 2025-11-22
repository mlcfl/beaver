import { cwd, platform } from "node:process";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { execa } from "execa";

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

	// Run process in the background
	// On Windows use execa for consistency with the rest of the code
	if (platform === "win32") {
		const child = execa("pnpm", ["dev", `--port=${port}`], {
			cwd: frontendPath,
			stdio: "ignore",
			detached: false, // it's important to set detached to false to enable windowsHide
			windowsHide: true, // hide console window on Windows
		});

		// Handle promise rejection when process is terminated (e.g., when stopped)
		child.catch(() => {
			// Ignore errors - process might be terminated intentionally
		});

		child.unref();
	} else {
		const child = spawn("pnpm", ["dev", `--port=${port}`], {
			cwd: frontendPath,
			stdio: "ignore",
			detached: true,
		});

		// Handle errors to prevent stream issues
		child.on("error", () => {});
		child.unref();
	}

	return { port };
});
