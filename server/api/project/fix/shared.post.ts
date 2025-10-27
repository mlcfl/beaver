import { mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import { $ } from "execa";

/**
 * Clones "shared-*" from GitHub and install them
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = join(cwd(), "../");
	const sharedPath = join(rootPath, "/shared");

	// Create root
	try {
		await access(sharedPath, constants.F_OK);
	} catch {
		await mkdir(sharedPath);
	}

	// Clone and install shared-all
	await $({
		cwd: sharedPath,
	})`git clone https://github.com/mlcfl/shared-all.git`;
	await $({
		cwd: join(sharedPath, "shared-all"),
	})`pnpm install --frozen-lockfile`;

	// Clone and install shared-backend
	await $({
		cwd: sharedPath,
	})`git clone https://github.com/mlcfl/shared-backend.git`;
	await $({
		cwd: join(sharedPath, "shared-backend"),
	})`pnpm install --frozen-lockfile`;

	// Clone and install shared-frontend
	await $({
		cwd: sharedPath,
	})`git clone https://github.com/mlcfl/shared-frontend.git`;
	await $({
		cwd: join(sharedPath, "shared-frontend"),
	})`pnpm install --frozen-lockfile`;
});
