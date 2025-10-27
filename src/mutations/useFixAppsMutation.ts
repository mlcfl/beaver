import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useFixAppsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn() {
			return $fetch("/api/project/fix/apps", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
			});
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["structure"] });
		},
	});
};
