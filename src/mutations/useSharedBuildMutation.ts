import { useMutation } from "@tanstack/vue-query";

export const useSharedBuildMutation = () => {
	return useMutation({
		mutationFn(sharedPart: "all" | "frontend" | "backend") {
			return $fetch("/api/shared/build", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
				body: JSON.stringify(sharedPart),
			});
		},
	});
};
