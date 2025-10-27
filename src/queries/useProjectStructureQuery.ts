import { useQuery } from "@tanstack/vue-query";
import type { StructureCheckResponse } from "~~/server/api/project/structure";

export const useProjectStructureQuery = () => {
	return useQuery<StructureCheckResponse>({
		queryKey: ["structure"],
		queryFn: () => $fetch("/api/project/structure"),
	});
};
