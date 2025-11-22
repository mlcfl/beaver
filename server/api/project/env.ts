import { $ } from "execa";

export interface EnvCheckResponse {
	node: {
		value: string;
		error?: string;
	};
	npm: {
		value: string;
		error?: string;
	};
	pnpm: {
		value: string;
		error?: string;
	};
	git: {
		value: string;
		error?: string;
	};
}

/**
 * @returns Project env validation result
 */
export default defineEventHandler(async (): Promise<EnvCheckResponse> => {
	const response: EnvCheckResponse = {
		node: { value: "" },
		npm: { value: "" },
		pnpm: { value: "" },
		git: { value: "" },
	};

	// Node.js
	const { stdout: nodeVersion } = await $`node -v`.catch(() => {
		response.node.error = "Node.js is not installed or not added to PATH";
		return { stdout: "" };
	});
	response.node.value = nodeVersion;

	// npm
	const { stdout: npmVersion } = await $`npm -v`.catch(() => {
		response.npm.error = "npm is not installed or not added to PATH";
		return { stdout: "" };
	});
	response.npm.value = npmVersion;

	// pnpm
	const { stdout: pnpmVersion } = await $`pnpm -v`.catch(() => {
		response.pnpm.error = "pnpm is not installed or not added to PATH";
		return { stdout: "" };
	});
	response.pnpm.value = pnpmVersion;

	// git
	const { stdout: gitVersion } = await $`git --version`.catch(() => {
		response.git.error = "git is not installed or not added to PATH";
		return { stdout: "" };
	});
	response.git.value = gitVersion;

	return response;
});
