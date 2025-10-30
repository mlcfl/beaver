import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Api } from "~/api";

export const usePatchMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			apps,
			part,
		}: {
			apps: string[];
			part: "all" | "shared" | "frontend" | "backend";
		}) => Api.patch("/apps/patch", { body: { apps, part } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["apps"] });
		},
	});
};
