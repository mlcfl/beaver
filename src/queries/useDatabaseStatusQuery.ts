import { useQuery } from "@tanstack/vue-query";
import type { DatabaseStatusResponse } from "~~/server/api/database/status.get";

export const useDatabaseStatusQuery = () =>
	useQuery<DatabaseStatusResponse>({
		queryKey: ["databaseStatus"],
		queryFn: () => $fetch("/api/database/status"),
	});
