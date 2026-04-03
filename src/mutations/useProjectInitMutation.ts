import { useMutation } from "@tanstack/vue-query";

export const useProjectInitMutation = () => {
	return useMutation({
		mutationFn() {
			return $fetch("/api/project/init", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
			});
		},
	});
};
