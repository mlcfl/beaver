import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Api } from "~/api";

export const useBuildMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			apps,
			part,
		}: {
			apps: string[];
			part: "all" | "shared" | "frontend" | "backend";
		}) => Api.post("/apps/build", { body: { apps, part } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apps"] });
		},
	});
};
