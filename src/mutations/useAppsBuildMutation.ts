import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Api } from "~/api";

export const useAppsBuildMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (selectedApps: string[]) =>
			Api.post("/apps/build", { body: selectedApps }),
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["apps"] });
		},
	});
};
