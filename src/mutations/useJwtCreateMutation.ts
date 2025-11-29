import { useMutation } from "@tanstack/vue-query";
import { Api } from "~/api";

/**
 * Create private and public keys for JWT
 */
export const useJwtCreateMutation = () => {
	return useMutation({
		mutationFn: (apps: string[]) => Api.post("/jwt", { body: apps }),
	});
};
