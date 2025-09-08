import { readdir } from "node:fs/promises";
import { cwd } from "node:process";
import { join } from "node:path";

/**
 * @returns List of applications
 */
export default defineEventHandler(async () => {
	const path = join(cwd(), "../apps");
	const files = await readdir(path, { withFileTypes: true });

	const directories = files
		.filter((file) => file.isDirectory())
		.map((dir) => ({ name: dir.name }));

	return {
		data: directories,
	};
});
