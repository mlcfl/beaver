import { platform } from "node:process";
import { execa } from "execa";

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
		const port = part === "frontend" ? 7100 : 7200;
		let pids: string[] = [];

		if (platform === "win32") {
			// On Windows, find process by port using netstat
			try {
				const { stdout } = await execa(`netstat -ano | findstr :${port}`, {
					shell: true,
					windowsHide: true,
				});
				// Extract PIDs from netstat output (last column)
				pids = stdout
					.split("\n")
					.map((line) => {
						const parts = line.trim().split(/\s+/);
						const pid = parts[parts.length - 1];
						return pid && /^\d+$/.test(pid) ? pid : null;
					})
					.filter((pid): pid is string => pid !== null);
			} catch {
				// If netstat fails, try wmic to find by command line
				try {
					const { stdout } = await execa(
						"wmic",
						[
							"process",
							"where",
							`commandline like '%pnpm dev --port=${port}%'`,
							"get",
							"processid",
							"/format:value",
						],
						{ windowsHide: true }
					);
					pids = stdout
						.split("\n")
						.map((line) => line.trim())
						.filter((line) => line.startsWith("ProcessId="))
						.map((line) => line.replace("ProcessId=", ""))
						.filter((pid): pid is string => pid !== "" && /^\d+$/.test(pid));
				} catch {
					// Both methods failed, no processes found
				}
			}
		} else {
			// On Unix-like systems, use pgrep
			const { stdout } = await execa(
				"pgrep",
				["-f", `pnpm dev --port=${port}|${selectedAppId}-${part}`],
				{
					windowsHide: true,
				}
			);
			pids = stdout.split("\n").filter(Boolean);
		}

		if (!pids.length) {
			throw createError({
				status: 400,
				message: "Dev server processes not found",
			});
		}

		// Kill processes asynchronously after response is sent to avoid stream pipe errors
		// This prevents the HTTP response stream from being closed before process termination completes
		setImmediate(async () => {
			await Promise.all(
				pids.map(async (pid) => {
					try {
						if (platform === "win32") {
							await execa("taskkill", ["/F", "/PID", pid], {
								windowsHide: true,
							});
						} else {
							await execa("kill", ["-9", pid], { windowsHide: true });
						}
					} catch {
						// Ignore kill errors - process might have died already
					}
				})
			);
		});

		// Return success immediately, process termination happens in background
		return { success: true, pids };
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
