import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $ } from "execa";
import { getRootPath } from "../../../utils";

/**
 * Clones "entry-server" from GitHub and install it
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();

	// Clone from GitHub
	await $({
		cwd: rootPath,
	})`git clone https://github.com/mlcfl/entry-server.git`;

	// Add .env files for development and production
	const rootEntryServerPath = join(rootPath, "entry-server");
	await copyFile(
		join(rootEntryServerPath, ".env.example"),
		join(rootEntryServerPath, ".env.development")
	);
	await copyFile(
		join(rootEntryServerPath, ".env.example"),
		join(rootEntryServerPath, ".env.production")
	);

	let envContent: string;
	// Modify .env.development to set some values
	const envDevelopmentPath = join(rootEntryServerPath, ".env.development");
	envContent = await readFile(envDevelopmentPath, "utf-8");
	envContent = envContent.replace(
		/APPS_CONFIG_FILE=.*/g,
		"APPS_CONFIG_FILE=./config.development.json"
	);
	await writeFile(envDevelopmentPath, envContent, "utf-8");

	// Modify .env.production to set some values
	const envProductionPath = join(rootEntryServerPath, ".env.production");
	envContent = await readFile(envProductionPath, "utf-8");
	envContent = envContent.replace(
		/APPS_CONFIG_FILE=.*/g,
		"APPS_CONFIG_FILE=./config.production.json"
	);
	await writeFile(envProductionPath, envContent, "utf-8");

	// Install deps
	await $({
		cwd: join(rootPath, "entry-server"),
	})`pnpm install --frozen-lockfile`;
});
