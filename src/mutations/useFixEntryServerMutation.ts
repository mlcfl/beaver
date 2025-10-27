import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useFixEntryServerMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn() {
			return $fetch("/api/project/fix/entryserver", {
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
