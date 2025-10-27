import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useFixSharedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn() {
			return $fetch("/api/project/fix/shared", {
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
