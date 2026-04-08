import { useMutation } from "@tanstack/vue-query";

export const usePatchDnsMutation = (options?: {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}) =>
	useMutation({
		mutationFn() {
			return $fetch("/api/project/patch-dns", {
				method: "POST",
				headers: { "X-Requested-With": "XMLHttpRequest" },
			});
		},
		onSuccess: options?.onSuccess,
		onError: options?.onError,
	});
