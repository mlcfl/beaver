import { useQuery } from "@tanstack/vue-query";
import type { AppsList } from "~~/server/api/apps";

export const useAppsQuery = () => {
	return useQuery<AppsList>({
		queryKey: ["apps"],
		queryFn: () => $fetch("/api/apps"),
	});
};
