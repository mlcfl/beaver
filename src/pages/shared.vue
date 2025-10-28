<template>
	<VSheet>
		<div class="mb-6">
			<h2>Shared / All</h2>
			<p class="mb-2 text-grey-darken-1">
				Contains common backend and frontend parts for all applications.
			</p>
			<VBtn variant="outlined" :loading="isAllBuilding" @click="build('all')"
				>Build</VBtn
			>
		</div>

		<div class="mb-6">
			<h2>Shared / Backend</h2>
			<p class="mb-2 text-grey-darken-1">
				Contains common backend parts for all applications.
			</p>
			<VBtn
				variant="outlined"
				:loading="isBackendBuilding"
				@click="build('backend')"
				>Build</VBtn
			>
		</div>

		<div class="mb-6">
			<h2>Shared / Frontend</h2>
			<p class="mb-2 text-grey-darken-1">
				Contains common frontend parts for all applications.
			</p>
			<VBtn
				variant="outlined"
				:loading="isFrontendBuilding"
				@click="build('frontend')"
				>Build</VBtn
			>
		</div>

		<VSnackbar
			v-model="snackbar.show"
			:text="snackbar.text"
			:color="snackbar.color"
			:timeout="3000"
		/>
	</VSheet>
</template>

<script lang="ts" setup>
import { useSharedBuildMutation } from "~/mutations";

// Snackbar
const snackbar = reactive({
	show: false,
	text: "",
	color: "info",
});

// Build modules
const currentBuildPart = ref<"all" | "frontend" | "backend" | null>(null);
const { mutate: buildShared, isPending: isBuilding } = useSharedBuildMutation();

const isAllBuilding = computed(
	() => isBuilding && currentBuildPart.value === "all"
);
const isBackendBuilding = computed(
	() => isBuilding && currentBuildPart.value === "backend"
);
const isFrontendBuilding = computed(
	() => isBuilding && currentBuildPart.value === "frontend"
);

const build = (part: "all" | "frontend" | "backend") => {
	currentBuildPart.value = part;

	buildShared(part, {
		onSuccess: () => {
			currentBuildPart.value = null;
			snackbar.text = "Build completed";
			snackbar.color = "success";
			snackbar.show = true;
		},
		onError: () => {
			currentBuildPart.value = null;
			snackbar.text = "Build error. Check server logs.";
			snackbar.color = "error";
			snackbar.show = true;
		},
	});
};
</script>
