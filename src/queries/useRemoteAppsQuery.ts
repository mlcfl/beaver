import { useQuery } from "@tanstack/vue-query";
import type { RemoteApp } from "~~/server/api/github/repos";

export const useRemoteAppsQuery = () => {
	return useQuery<RemoteApp[]>({
		queryKey: ["remoteApps"],
		queryFn: () => $fetch("/api/github/repos"),
		enabled: false,
	});
};
