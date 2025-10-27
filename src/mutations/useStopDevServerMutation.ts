import { useMutation } from "@tanstack/vue-query";

export const useStopDevServerMutation = () => {
	return useMutation({
		mutationFn({
			apps,
			part,
		}: {
			apps: string[];
			part: "frontend" | "backend";
		}) {
			return $fetch("/api/apps/stop", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
				body: { apps, part },
			});
		},
	});
};
