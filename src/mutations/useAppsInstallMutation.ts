import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useAppsInstallMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn(selectedApps: string[]) {
			return $fetch("/api/apps/install", {
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
