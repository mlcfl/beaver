import { useMutation } from "@tanstack/vue-query";
import { Api } from "~/api";

/**
 * Create and save pepper for password hashing
 */
export const usePepperCreateMutation = () => {
	return useMutation({
		mutationFn: () => Api.post("/pepper"),
	});
};
