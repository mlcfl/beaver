import { useMutation } from "@tanstack/vue-query";

export const useRunDevServerMutation = () => {
	return useMutation({
		mutationFn({
			apps,
			part,
		}: {
			apps: string[];
			part: "frontend" | "backend";
		}) {
			return $fetch("/api/apps/run", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
				body: { apps, part },
			});
		},
	});
};
