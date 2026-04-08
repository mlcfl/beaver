import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
	getRootPath,
	patchEnvFiles,
	getInstalledAppIds,
	execaMessage,
	$buf,
} from "../../utils";

type Body = {
	pgPassword?: string;
};

const PG_URL = `"postgresql://mlc:mlc@localhost:5432/mlc?schema=public"`;

export default defineEventHandler(async (event): Promise<void> => {
	const { pgPassword = "" } = await readBody<Body>(event);
	const rootPath = getRootPath();
	const appsPath = join(rootPath, "apps");

	const env = { ...process.env, PGPASSWORD: pgPassword };

	try {
		await $buf({
			env,
		})`psql -U postgres -c ${"CREATE USER mlc WITH PASSWORD 'mlc';"}`;
	} catch (e: unknown) {
		const msg = execaMessage("psql", e);
		if (!msg.includes("already exists")) {
			throw createError({ statusCode: 500, statusMessage: `psql: ${msg}` });
		}
	}

	try {
		await $buf({
			env,
		})`psql -U postgres -c ${"CREATE DATABASE mlc OWNER mlc;"}`;
	} catch (e: unknown) {
		const msg = execaMessage("psql", e);
		if (!msg.includes("already exists")) {
			throw createError({ statusCode: 500, statusMessage: `psql: ${msg}` });
		}
	}

	// Patch env files in all installed backends
	const appIds = await getInstalledAppIds(appsPath);

	for (const appId of appIds) {
		const backendPath = join(appsPath, appId, `${appId}-backend`);

		let content = "";
		try {
			content = await readFile(join(backendPath, ".env.development"), "utf-8");
		} catch {
			continue;
		}

		const hasPg = /^PG_DATABASE_URL=/m.test(content);
		if (!hasPg) continue;

		const replacements: [RegExp, string][] = [
			[/PG_DATABASE_URL=.*/g, `PG_DATABASE_URL=${PG_URL}`],
		];

		const hasMongo = /^MONGO_DATABASE_URL=/m.test(content);
		if (!hasMongo) {
			replacements.push([/DATABASE_MODE=.*/g, "DATABASE_MODE=real"]);
		} else {
			const isMongoConfigured = !/MONGO_DATABASE_URL=.*<user>/.test(content);
			if (isMongoConfigured) {
				replacements.push([/DATABASE_MODE=.*/g, "DATABASE_MODE=real"]);
			}
		}

		await patchEnvFiles(backendPath, replacements);

		try {
			await $buf({ cwd: backendPath })`pnpm prisma:deploy:pg`;
		} catch (e: unknown) {
			throw createError({
				statusCode: 500,
				statusMessage: `${appId}: prisma:deploy:pg failed: ${execaMessage("pnpm", e)}`,
			});
		}
	}
});
