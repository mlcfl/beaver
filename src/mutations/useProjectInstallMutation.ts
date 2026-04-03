import { useMutation } from "@tanstack/vue-query";

export const useProjectInstallMutation = () => {
	return useMutation({
		mutationFn() {
			return $fetch("/api/project/install", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
			});
		},
	});
};
