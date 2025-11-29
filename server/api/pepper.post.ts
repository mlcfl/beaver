import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { getRootPath } from "../utils";

const updatePepper = async (path: string, pepper: string) => {
	let envContent = await readFile(path, "utf-8");
	envContent = envContent.replace(
		/PASSWORD_PEPPER=.*/g,
		`PASSWORD_PEPPER=${pepper}`
	);
	await writeFile(path, envContent, "utf-8");
};

/**
 * Creates a new pepper and updates it in the .env files of the auth app backend and entry-server
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");

	const pepperVersion = 1;
	const pepper = randomUUID();
	const finalPepper = `${pepperVersion}.${pepper}`;

	// Save to auth backend
	const appId = "auth";
	const rootAppPath = join(appsPath, appId, `${appId}-backend`);
	const envDevPath = join(rootAppPath, ".env.development");
	const envProdPath = join(rootAppPath, ".env.production");

	await updatePepper(envDevPath, finalPepper);
	await updatePepper(envProdPath, finalPepper);

	// Save to /entry-server
	const entryServerPath = join(rootPath, "entry-server");
	const entryEnvDevPath = join(entryServerPath, ".env.development");
	const entryEnvProdPath = join(entryServerPath, ".env.production");

	await updatePepper(entryEnvDevPath, finalPepper);
	await updatePepper(entryEnvProdPath, finalPepper);
});
