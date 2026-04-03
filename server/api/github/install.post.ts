import { mkdir, access, copyFile, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { $ } from "execa";
import { getRootPath } from "../../utils";
import type { RemoteApp } from "./repos";

/**
 * Clone app from GitHub and install it
 */
export default defineEventHandler(async (event): Promise<void> => {
	const { appId, shared, backend, frontend } = await readBody<RemoteApp>(event);
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "/apps");

	// Create root directory if it doesn't exist
	const rootAppPath = join(appsPath, appId);
	try {
		await access(rootAppPath, constants.F_OK);
	} catch {
		await mkdir(rootAppPath);
	}

	// Clone shared
	if (shared) {
		await $({ cwd: rootAppPath })`git clone ${shared} ${appId}-shared`;
		// No .env file
	}

	// Clone backend
	if (backend) {
		await $({ cwd: rootAppPath })`git clone ${backend} ${appId}-backend`;

		// Add .env files for development and production
		const rootAppPartPath = join(rootAppPath, `${appId}-backend`);
		await copyFile(
			join(rootAppPartPath, ".env.example"),
			join(rootAppPartPath, ".env.development")
		);
		await copyFile(
			join(rootAppPartPath, ".env.example"),
			join(rootAppPartPath, ".env.production")
		);

		// Modify .env.production to set some values
		const envProductionPath = join(rootAppPartPath, ".env.production");
		let envContent = await readFile(envProductionPath, "utf-8");
		envContent = envContent.replace(/CORS_ENABLED=.*/g, "CORS_ENABLED=false");
		envContent = envContent.replace(/CORS_ORIGIN=.*/g, "CORS_ORIGIN=");
		await writeFile(envProductionPath, envContent, "utf-8");
	}

	// Clone frontend
	if (frontend) {
		await $({ cwd: rootAppPath })`git clone ${frontend} ${appId}-frontend`;

		// Add .env files for development and production
		const rootAppPartPath = join(rootAppPath, `${appId}-frontend`);
		await copyFile(
			join(rootAppPartPath, ".env.example"),
			join(rootAppPartPath, ".env.development")
		);
		await copyFile(
			join(rootAppPartPath, ".env.example"),
			join(rootAppPartPath, ".env.production")
		);

		// Modify .env.production to set empty values for API base URLs
		// For work on the same domain at the backend and for usage with entry-server
		const envProductionPath = join(rootAppPartPath, ".env.production");
		let envContent = await readFile(envProductionPath, "utf-8");
		envContent = envContent.replace(
			/NUXT_PUBLIC_API_BASE=.*/g,
			"NUXT_PUBLIC_API_BASE="
		);
		envContent = envContent.replace(
			/NUXT_PUBLIC_AUTH_API_BASE=.*/g,
			"NUXT_PUBLIC_AUTH_API_BASE="
		);
		await writeFile(envProductionPath, envContent, "utf-8");
	}
});
