import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useAppsBuildMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn(selectedApps: string[]) {
			return $fetch("/api/apps/build", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
				body: selectedApps,
			});
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["apps"] });
		},
	});
};
