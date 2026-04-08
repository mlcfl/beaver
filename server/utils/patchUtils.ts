import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

/**
 * Reads all .env.* files in a directory, excluding .env.example,
 * and applies the given replacements to each.
 * Silently skips if the directory does not exist.
 */
export const patchEnvFiles = async (
	dirPath: string,
	replacements: [RegExp, string][],
): Promise<void> => {
	let files: string[];
	try {
		files = await readdir(dirPath);
	} catch {
		return;
	}

	const envFiles = files.filter(
		(f) => f.startsWith(".env.") && f !== ".env.example",
	);

	for (const file of envFiles) {
		const filePath = join(dirPath, file);
		let content = await readFile(filePath, "utf-8");
		for (const [pattern, replacement] of replacements) {
			content = content.replace(pattern, replacement);
		}
		await writeFile(filePath, content, "utf-8");
	}
};

/**
 * Returns app IDs (directory names under appsPath) that have the given part directory installed.
 */
const getInstalledAppIdsForPart = async (
	appsPath: string,
	part: "backend" | "frontend" | "shared",
): Promise<string[]> => {
	const entries = await readdir(appsPath, { withFileTypes: true });
	const appIds: string[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const appId = entry.name;
		try {
			await access(join(appsPath, appId, `${appId}-${part}`), constants.F_OK);
			appIds.push(appId);
		} catch {
			// part not installed, skip
		}
	}

	return appIds;
};

export const getInstalledAppIds = (appsPath: string) =>
	getInstalledAppIdsForPart(appsPath, "backend");

export const getInstalledFrontendIds = (appsPath: string) =>
	getInstalledAppIdsForPart(appsPath, "frontend");
