import { useMutation } from "@tanstack/vue-query";

export const usePostgresSetupMutation = (options?: {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}) =>
	useMutation({
		mutationFn(pgPassword: string) {
			return $fetch("/api/database/postgres", {
				method: "POST",
				headers: { "X-Requested-With": "XMLHttpRequest" },
				body: { pgPassword },
			});
		},
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
