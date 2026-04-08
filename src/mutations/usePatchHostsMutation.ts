import { useMutation } from "@tanstack/vue-query";

export const usePatchHostsMutation = (options?: {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}) =>
	useMutation({
		mutationFn() {
			return $fetch("/api/project/patch-hosts", {
				method: "POST",
				headers: { "X-Requested-With": "XMLHttpRequest" },
			});
		},
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
