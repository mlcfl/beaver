import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useAppsLinkingMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn(selectedApps: string[]) {
			return $fetch("/api/apps/link", {
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
