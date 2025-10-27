import { useQuery } from "@tanstack/vue-query";
import type { EnvCheckResponse } from "~~/server/api/project/env";

export const useProjectEnvQuery = () => {
	return useQuery<EnvCheckResponse>({
		queryKey: ["env"],
		queryFn: () => $fetch("/api/project/env"),
	});
};
