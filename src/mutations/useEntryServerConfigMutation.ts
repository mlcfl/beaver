import { useMutation } from "@tanstack/vue-query";
import { Api } from "~/api";

export const useEntryServerConfigMutation = () => {
	return useMutation({
		mutationFn: () => Api.post("/entry-server/config"),
	});
};
