import { cwd } from "node:process";
import { join, basename } from "node:path";

let rootPath: string | null = null;

/**
 * Get the root path of the project
 *
 * During development (pnpm dev): cwd() = ./mlc/beaver.
 * During production (pnpm start): cwd() = ./mlc/beaver/.output.
 *
 * This function always returns the path to the root directory
 */
export const getRootPath = (): string => {
	if (rootPath) {
		return rootPath;
	}

	const path = cwd();

	// If in .output directory (production build), go up one more level
	if (basename(path) === ".output") {
		rootPath = join(cwd(), "../../");
	} else {
		rootPath = join(cwd(), "../");
	}

	return rootPath;
};
