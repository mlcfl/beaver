import { readFile, writeFile, readdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import {
	getRootPath,
	patchEnvFiles,
	getInstalledAppIds,
	execaMessage,
	$buf,
} from "../../utils";

const MONGO_URL = `"mongodb://mlc:mlc@localhost:27017/mlc?authSource=mlc"`;

const REPLICATION_BLOCK = `
replication:
  replSetName: "rs0"
`;

/**
 * Returns the path to mongod.cfg/mongod.conf depending on the platform.
 * Windows: C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg
 * Linux:   /etc/mongod.conf
 * macOS:   /usr/local/etc/mongod.conf or /opt/homebrew/etc/mongod.conf
 */
async function findMongodConfig(): Promise<string> {
	if (process.platform === "win32") {
		const serverDir = "C:\\Program Files\\MongoDB\\Server";
		let entries: string[];
		try {
			entries = await readdir(serverDir);
		} catch {
			throw createError({
				statusCode: 500,
				statusMessage: `MongoDB directory not found: ${serverDir}`,
			});
		}
		const versions = entries
			.filter((e) => /^\d+(\.\d+)*$/.test(e))
			.sort((a, b) => parseFloat(b) - parseFloat(a));
		if (!versions.length) {
			throw createError({
				statusCode: 500,
				statusMessage: "No installed MongoDB version found in Program Files",
			});
		}
		return join(serverDir, versions[0]!, "bin", "mongod.cfg");
	}

	// macOS (Homebrew)
	for (const p of [
		"/opt/homebrew/etc/mongod.conf",
		"/usr/local/etc/mongod.conf",
	]) {
		try {
			await access(p, constants.F_OK);
			return p;
		} catch {
			// try next
		}
	}

	// Linux
	return "/etc/mongod.conf";
}

/**
 * Adds replication.replSetName = rs0 to mongod config if not already present.
 * Returns true if the file was modified.
 */
async function enableReplication(configPath: string): Promise<boolean> {
	let content: string;
	try {
		content = await readFile(configPath, "utf-8");
	} catch {
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to read MongoDB config: ${configPath}`,
		});
	}

	if (content.includes("replSetName")) return false;

	await writeFile(
		configPath,
		content.trimEnd() + "\n" + REPLICATION_BLOCK,
		"utf-8",
	);
	return true;
}

/**
 * Restarts the MongoDB system service.
 */
async function restartMongodService(): Promise<void> {
	try {
		if (process.platform === "win32") {
			await $buf`net stop MongoDB`;
			await $buf`net start MongoDB`;
		} else {
			await $buf`sudo systemctl restart mongod`;
		}
	} catch (e: unknown) {
		throw createError({
			statusCode: 500,
			statusMessage: `Failed to restart MongoDB service: ${execaMessage("net", e)}`,
		});
	}
}

/**
 * Waits for mongod to accept connections (up to maxAttempts × intervalMs).
 */
async function waitForMongod(
	maxAttempts = 15,
	intervalMs = 1000,
): Promise<void> {
	for (let i = 0; i < maxAttempts; i++) {
		await new Promise((r) => setTimeout(r, intervalMs));
		try {
			await $buf`mongosh --eval ${"db.adminCommand('ping')"}`;
			return;
		} catch {
			// not ready yet
		}
	}
	throw createError({
		statusCode: 500,
		statusMessage: "MongoDB did not start after restart. Check the service.",
	});
}

/**
 * Sets up MongoDB for MLC:
 * 1. Enables replica set in mongod config (required for Prisma transactions)
 * 2. Restarts MongoDB service
 * 3. Initiates the replica set
 * 4. Creates user 'mlc' with password 'mlc' and database 'mlc'
 * 5. Patches MONGO_DATABASE_URL in all installed backends
 */
export default defineEventHandler(async (): Promise<void> => {
	// Step 1: Enable replication in config
	const configPath = await findMongodConfig();
	const configChanged = await enableReplication(configPath);

	// Step 2: Restart service if config was changed
	if (configChanged) {
		await restartMongodService();
		await waitForMongod();
	}

	// Step 3: Initiate replica set
	try {
		await $buf`mongosh --eval ${"rs.initiate()"}`;
	} catch (e: unknown) {
		const msg = execaMessage("mongosh", e);
		if (
			!msg.includes("already initialized") &&
			!msg.includes("AlreadyInitialized")
		) {
			throw createError({
				statusCode: 500,
				statusMessage: `rs.initiate(): ${msg}`,
			});
		}
	}

	// Step 4: Create user
	const createUserJs = `db.getSiblingDB('mlc').createUser({ user: 'mlc', pwd: 'mlc', roles: [{ role: 'dbOwner', db: 'mlc' }] })`;
	try {
		await $buf`mongosh --eval ${createUserJs}`;
	} catch (e: unknown) {
		const msg = execaMessage("mongosh", e);
		if (!msg.includes("already exists")) {
			throw createError({
				statusCode: 500,
				statusMessage: `mongosh: ${msg}`,
			});
		}
	}

	// Step 5: Patch env files in all installed backends that use MongoDB
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");
	const appIds = await getInstalledAppIds(appsPath);

	for (const appId of appIds) {
		const backendPath = join(appsPath, appId, `${appId}-backend`);

		let content = "";
		try {
			content = await readFile(join(backendPath, ".env.development"), "utf-8");
		} catch {
			continue;
		}

		const hasMongo = /^MONGO_DATABASE_URL=/m.test(content);
		if (!hasMongo) continue;

		const replacements: [RegExp, string][] = [
			[/MONGO_DATABASE_URL=.*/g, `MONGO_DATABASE_URL=${MONGO_URL}`],
		];

		const hasPg = /^PG_DATABASE_URL=/m.test(content);
		if (!hasPg) {
			replacements.push([/DATABASE_MODE=.*/g, "DATABASE_MODE=real"]);
		} else {
			const isPgConfigured = !/PG_DATABASE_URL=.*<user>/.test(content);
			if (isPgConfigured) {
				replacements.push([/DATABASE_MODE=.*/g, "DATABASE_MODE=real"]);
			}
		}

		await patchEnvFiles(backendPath, replacements);

		try {
			await $buf({ cwd: backendPath })`pnpm prisma:deploy:mongo`;
		} catch (e: unknown) {
			throw createError({
				statusCode: 500,
				statusMessage: `${appId}: prisma:deploy:mongo failed: ${execaMessage("mongosh", e)}`,
			});
		}
	}
});
