import { mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { $ } from "execa";
import { getRootPath } from "../../../utils";

/**
 * Clones "shared-*" from GitHub and install them
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	const sharedPath = join(rootPath, "/shared");

	// Create root
	try {
		await access(sharedPath, constants.F_OK);
	} catch {
		await mkdir(sharedPath);
	}

	// Clone shared-all
	await $({
		cwd: sharedPath,
	})`git clone https://github.com/mlcfl/shared-all.git`;

	// Clone shared-backend
	await $({
		cwd: sharedPath,
	})`git clone https://github.com/mlcfl/shared-backend.git`;

	// Clone shared-frontend
	await $({
		cwd: sharedPath,
	})`git clone https://github.com/mlcfl/shared-frontend.git`;
});
