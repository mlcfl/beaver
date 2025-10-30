import { defineStore } from "pinia";

type SnackbarState = {
	show: boolean;
	text: string;
	color: string;
};

export const useAppsStore = defineStore("apps", () => {
	// Table selection
	const selectedApps = ref<string[]>([]);

	// Snackbar
	const snackbar = reactive<SnackbarState>({
		show: false,
		text: "",
		color: "info",
	});
	const showSnackbar = (text: string, color: string = "info") => {
		snackbar.text = text;
		snackbar.color = color;
		snackbar.show = true;
	};
	const showSuccessSnackbar = (text: string) => showSnackbar(text, "success");
	const showErrorSnackbar = (text: string) => showSnackbar(text, "error");
	const showInfoSnackbar = (text: string) => showSnackbar(text, "info");

	return {
		selectedApps,

		snackbar,
		showSnackbar,
		showSuccessSnackbar,
		showErrorSnackbar,
		showInfoSnackbar,
	};
});
