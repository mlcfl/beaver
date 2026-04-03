import { $ } from "execa";
import { getRootPath } from "../../utils";

/**
 * Runs pnpm install from the workspace root.
 * Must be called after all packages have been cloned.
 */
export default defineEventHandler(async (): Promise<void> => {
	const rootPath = getRootPath();
	await $({ cwd: rootPath })`pnpm install`;
});
