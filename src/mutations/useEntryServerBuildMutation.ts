import { useMutation } from "@tanstack/vue-query";
import { Api } from "~/api";

export const useEntryServerBuildMutation = () => {
	return useMutation({
		mutationFn: () => Api.post("/entry-server/build"),
	});
};
