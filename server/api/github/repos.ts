export interface GithubRepo {
	name: string;
	clone_url: string;
}

export interface RemoteApp {
	appId: string;
	shared?: string;
	backend?: string;
	frontend?: string;
}

/**
 * @returns GitHub repositories of the project
 */
export default defineEventHandler(async (): Promise<RemoteApp[]> => {
	const res = await fetch("https://api.github.com/orgs/mlcfl/repos");
	const repos = (await res.json()) as GithubRepo[];

	const grouped = repos.reduce((acc, { name, clone_url: cloneUrl }) => {
		const [, appId, part] =
			name.match(/^app-(.+)-(shared|backend|frontend)$/) ?? [];

		if (!appId || !part) {
			return acc;
		}

		const existingApp = acc.find((a) => a.appId === appId);

		if (!existingApp) {
			acc.push({
				appId,
				[part]: cloneUrl,
			});
		} else {
			existingApp[part as keyof RemoteApp] = cloneUrl;
		}

		return acc;
	}, [] as RemoteApp[]);

	return grouped.sort((a, b) => a.appId.localeCompare(b.appId));
});
