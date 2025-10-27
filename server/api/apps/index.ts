import { readdir } from "node:fs/promises";
import { accessSync, constants, readFileSync } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";

export interface AppItem {
	id: string;
	parts: {
		shared: boolean;
		backend: boolean;
		frontend: boolean;
	};
	deps: boolean; // for each existing part
	linking: {
		shared: {
			sharedAll: boolean;
		};
		backend: {
			sharedAll: boolean;
			sharedBackend: boolean;
			sharedLocal: boolean;
		};
		frontend: {
			sharedAll: boolean;
			sharedFrontend: boolean;
			sharedLocal: boolean;
		};
	};
}

export type AppsList = AppItem[];

const checkNodeModules = (path: string) => {
	try {
		accessSync(join(path, "node_modules"), constants.F_OK);
		return true;
	} catch {
		return false;
	}
};

/**
 * @returns List of applications
 */
export default defineEventHandler<Promise<AppsList>>(async () => {
	const rootPath = join(cwd(), "../");
	const appsPath = join(rootPath, "/apps");
	const files = await readdir(appsPath, { withFileTypes: true });

	const applicationParts = ["shared", "backend", "frontend"] as const;

	const directories = files
		.filter((file) => file.isDirectory())
		.map((dir) => {
			const id = dir.name;
			const item = {
				id: dir.name,
				parts: {
					shared: false,
					backend: false,
					frontend: false,
				},
				deps: true,
				linking: {
					shared: {
						sharedAll: false,
					},
					backend: {
						sharedAll: false,
						sharedBackend: false,
						sharedLocal: false,
					},
					frontend: {
						sharedAll: false,
						sharedFrontend: false,
						sharedLocal: false,
					},
				},
			};

			// Check application parts
			for (const part of applicationParts) {
				try {
					const partPath = join(appsPath, id, `${id}-${part}`);
					accessSync(partPath, constants.F_OK);
					item.parts[part] = true;

					const packageJsonFile = readFileSync(
						join(partPath, "package.json"),
						"utf-8"
					);
					const packageJson = JSON.parse(packageJsonFile);

					// Check linking to shared packages
					const { dependencies } = packageJson ?? {};
					const sharedAll = dependencies?.["@shared/all"];
					const sharedBackend = dependencies?.["@shared/backend"];
					const sharedFrontend = dependencies?.["@shared/frontend"];
					const sharedLocal = dependencies?.["shared"];

					item.linking[part].sharedAll = Boolean(sharedAll);

					if (part !== "shared") {
						item.linking[part].sharedLocal = Boolean(sharedLocal);
					}

					if (part === "backend") {
						item.linking[part].sharedBackend = Boolean(sharedBackend);
					}

					if (part === "frontend") {
						item.linking[part].sharedFrontend = Boolean(sharedFrontend);
					}

					// Check node_modules
					if (item.deps) {
						item.deps = checkNodeModules(partPath);
					}
				} catch {
					// Do nothing
				}
			}

			return item;
		});

	return directories;
});
