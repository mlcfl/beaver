import { mkdir, access, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";
import type { RemoteApp } from "./repos";

/**
 * Clone app from GitHub and install it
 */
export default defineEventHandler(async (event): Promise<void> => {
	const { appId, shared, backend, frontend } = await readBody<RemoteApp>(event);
	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");

	// Create root directory if it doesn't exist
	const rootAppPath = join(appsPath, appId);
	try {
		await access(rootAppPath, constants.F_OK);
	} catch {
		await mkdir(rootAppPath);
	}

	// Install shared
	if (shared) {
		await $({ cwd: rootAppPath })`git clone ${shared} ${appId}-shared`;
		await $({
			cwd: join(rootAppPath, `${appId}-shared`),
		})`pnpm install --frozen-lockfile`;
		// No .env file
	}

	// Install backend
	if (backend) {
		await $({ cwd: rootAppPath })`git clone ${backend} ${appId}-backend`;
		await $({
			cwd: join(rootAppPath, `${appId}-backend`),
		})`pnpm install --frozen-lockfile`;
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
	}

	// Install frontend
	if (frontend) {
		await $({ cwd: rootAppPath })`git clone ${frontend} ${appId}-frontend`;
		await $({
			cwd: join(rootAppPath, `${appId}-frontend`),
		})`pnpm install --frozen-lockfile`;
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
	}
});
