import { join } from "node:path";
import {
	getRootPath,
	patchEnvFiles,
	getInstalledAppIds,
	getInstalledFrontendIds,
} from "../../utils";

const DOMAIN = "localhost.direct";

/**
 * Patches all env files (except .env.example) in entry-server and each installed
 * backend to use localhost.direct for cross-subdomain cookie sharing in development.
 * No system modifications required — uses public wildcard DNS.
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");
	const installedAppIds = await getInstalledAppIds(appsPath);
	const installedFrontendIds = await getInstalledFrontendIds(appsPath);

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
