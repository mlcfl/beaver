import { readFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { platform } from "node:os";
import {
	getRootPath,
	patchEnvFiles,
	getInstalledAppIds,
	getInstalledFrontendIds,
} from "../../utils";

const DOMAIN = "mlc.local";
const HOSTS_MARKER = `# MLC Project (${DOMAIN})`;

const hostsPath =
	platform() === "win32"
		? "C:\\Windows\\System32\\drivers\\etc\\hosts"
		: "/etc/hosts";

const WRITABLE_ERROR = `Hosts file is not writable: ${hostsPath}. Run Beaver with administrator/sudo privileges.`;

/**
 * Patches the system hosts file and all env files (except .env.example) to use
 * mlc.local domain. Requires write access to the hosts file — run Beaver with
 * administrator/sudo privileges if needed.
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");
	const installedAppIds = await getInstalledAppIds(appsPath);
	const installedFrontendIds = await getInstalledFrontendIds(appsPath);

	// Append entries only if not already present
	let hostsContent: string;
	try {
		hostsContent = await readFile(hostsPath, "utf-8");
	} catch {
		throw createError({ statusCode: 403, statusMessage: WRITABLE_ERROR });
	}

	if (!hostsContent.includes(HOSTS_MARKER)) {
		const newEntries = [
			"",
			HOSTS_MARKER,
			`127.0.0.1 ${DOMAIN}`,
			...installedAppIds.map((id) => `127.0.0.1 ${id}.${DOMAIN}`),
			"",
		].join("\n");

		try {
			await appendFile(hostsPath, newEntries, "utf-8");
		} catch (e: any) {
			if (e?.code === "EPERM" || e?.code === "EACCES") {
				throw createError({ statusCode: 403, statusMessage: WRITABLE_ERROR });
			}
			throw e;
		}
	}

	// Patch entry-server env files
	await patchEnvFiles(join(rootPath, "entry-server"), [
		[/SERVER_MODE=.*/g, `SERVER_MODE=${DOMAIN}`],
		[/SERVER_HOST=.*/g, `SERVER_HOST=${DOMAIN}`],
		[/REFRESH_TOKEN_URL=.*/g, `REFRESH_TOKEN_URL=http://auth.${DOMAIN}`],
		[/CORS_ORIGIN=.*/g, `CORS_ORIGIN=http://${DOMAIN}`],
	]);

	// Patch each backend's env files
	for (const appId of installedAppIds) {
		await patchEnvFiles(join(appsPath, appId, `${appId}-backend`), [
			[/SERVER_HOST=.*/g, `SERVER_HOST=${DOMAIN}`],
			[/REFRESH_TOKEN_URL=.*/g, `REFRESH_TOKEN_URL=http://auth.${DOMAIN}`],
			[/CORS_ORIGIN=.*/g, `CORS_ORIGIN=http://${DOMAIN}`],
		]);
	}

	// Patch each frontend's env files
	// Using .+ (not .*) to skip already-empty values in .env.production
	for (const appId of installedFrontendIds) {
		await patchEnvFiles(join(appsPath, appId, `${appId}-frontend`), [
			[
				/NUXT_PUBLIC_API_BASE=.+/g,
				`NUXT_PUBLIC_API_BASE=http://${appId}.${DOMAIN}`,
			],
			[
				/NUXT_PUBLIC_AUTH_API_BASE=.+/g,
				`NUXT_PUBLIC_AUTH_API_BASE=http://auth.${DOMAIN}`,
			],
		]);
	}
});
