import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getRootPath, getInstalledAppIds } from "../../utils";

export type DatabaseStatusResponse = {
	postgres: boolean;
	mongo: boolean;
};

/**
 * Returns whether PostgreSQL and MongoDB connection strings are configured
 * (i.e. no longer contain placeholder values like <user>).
 */
export default defineEventHandler(async (): Promise<DatabaseStatusResponse> => {
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");
	const appIds = await getInstalledAppIds(appsPath);

	let postgres = false;
	let mongo = false;

	for (const appId of appIds) {
		const envPath = join(
			appsPath,
			appId,
			`${appId}-backend`,
			".env.development",
		);
		let content = "";
		try {
			content = await readFile(envPath, "utf-8");
		} catch {
			continue;
		}

		if (!postgres && /^PG_DATABASE_URL=/m.test(content)) {
			postgres = !/PG_DATABASE_URL=.*<user>/.test(content);
		}
		if (!mongo && /^MONGO_DATABASE_URL=/m.test(content)) {
			mongo = !/MONGO_DATABASE_URL=.*<user>/.test(content);
		}

		if (postgres && mongo) break;
	}

	return { postgres, mongo };
});
