import { access } from "node:fs/promises";
import { join, basename } from "node:path";
import { constants } from "node:fs";
import { getRootPath } from "../../utils";

export interface StructureCheckResponse {
	projectName: {
		value: string;
		error?: string;
	};
	builderDir: {
		error?: string;
	};
	entryServerDir: {
		error?: string;
	};
	sharedDirs: {
		errors?: string[];
	};
	appsDir: {
		error?: string;
	};
}

/**
 * @returns Project structure validation result
 */
export default defineEventHandler(async (): Promise<StructureCheckResponse> => {
	const response: StructureCheckResponse = {
		projectName: { value: "" },
		builderDir: {},
		entryServerDir: {},
		sharedDirs: {},
		appsDir: {},
	};

	// Check root dir name
	const projectName = "mlc";
	const rootPath = getRootPath();
	const rootDirName = basename(rootPath);

	response.projectName = {
		value: projectName,
		error:
			rootDirName !== projectName
				? `The project should be in the directory "${projectName}", but the current root directory is "${rootDirName}".`
				: undefined,
	};

	// Check builder directory
	try {
		await access(join(rootPath, "/beaver"), constants.F_OK);
	} catch {
		response.builderDir.error = 'Builder directory "/beaver" not found.';
	}

	// Check entry server directory
	try {
		await access(join(rootPath, "/entry-server"), constants.F_OK);
	} catch {
		response.entryServerDir.error =
			'Entry server directory "/entry-server" not found.';
	}

	// Check shared directories
	const sharedErrors: string[] = [];
	const sharedDirs = [
		"/shared",
		"/shared/shared-all",
		"/shared/shared-backend",
		"/shared/shared-frontend",
	];

	for (const sharedDir of sharedDirs) {
		try {
			await access(join(rootPath, sharedDir), constants.F_OK);
		} catch {
			sharedErrors.push(`Shared directory "${sharedDir}" not found.`);
		}
	}

	if (sharedErrors.length > 0) {
		response.sharedDirs.errors = sharedErrors;
	}

	// Check apps directory
	try {
		await access(join(rootPath, "/apps"), constants.F_OK);
	} catch {
		response.appsDir.error = 'Applications directory "/apps" not found.';
	}

	return response;
});
