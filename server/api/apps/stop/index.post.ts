import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Stop frontend or backend for selected apps
 * Now only supports one app at a time
 */
export default defineEventHandler(async (event) => {
	const { apps: selectedApps, part } = await readBody<{
		apps: string[];
		part: "frontend" | "backend";
	}>(event);
	const [selectedAppId] = selectedApps;

	if (!selectedAppId) {
		throw createError({
			status: 400,
			message: "No app selected",
		});
	}

	try {
		// Get the PIDs of the running processes for the selected app
		const port = part === "frontend" ? 7100 : 7200;
		const { stdout } = await execAsync(
			`pgrep -f "pnpm dev --port=${port}|${selectedAppId}-${part}"`,
			{ windowsHide: true }
		);
		const pids = stdout.split("\n").filter(Boolean);

		if (!pids.length) {
			throw createError({
				status: 400,
				message: "Dev server processes not found",
			});
		}

		// Kill processes quietly, ignoring errors if process already died
		await Promise.all(
			pids.map(async (pid) => {
				try {
					await execAsync(`kill -9 ${pid}`, { windowsHide: true });
				} catch {
					// Ignore kill errors - process might have died already
				}
			})
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error:", error.message);
		}

		if (error && typeof error === "object" && "statusCode" in error) {
			throw error;
		}

		// If processes not found
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === 1
		) {
			return;
		}

		throw createError({
			status: 500,
			message: "Failed to stop dev server process",
		});
	}
});
