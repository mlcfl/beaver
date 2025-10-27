import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { RemoteApp } from "~~/server/api/github/repos";

export const useRemoteAppInstall = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn(app: RemoteApp) {
			return $fetch("/api/github/install", {
				method: "POST",
				headers: {
					"X-Requested-With": "XMLHttpRequest",
				},
				body: app,
			});
		},
		onSuccess() {
			queryClient.invalidateQueries({ queryKey: ["apps"] });
			queryClient.invalidateQueries({ queryKey: ["remoteApps"] });
		},
	});
};
