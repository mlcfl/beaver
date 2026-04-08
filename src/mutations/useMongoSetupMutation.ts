import { useMutation } from "@tanstack/vue-query";

export const useMongoSetupMutation = (options?: {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}) =>
	useMutation({
		mutationFn() {
			return $fetch("/api/database/mongo", {
				method: "POST",
				headers: { "X-Requested-With": "XMLHttpRequest" },
			});
		},
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
