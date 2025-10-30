<template>
	<VMenu>
		<template #activator="{ props, isActive }">
			<VBtn
				variant="outlined"
				:append-icon="isActive ? 'mdi-chevron-up' : 'mdi-chevron-down'"
				v-bind="props"
				:disabled="!store.selectedApps.length"
				:loading="isPending"
				>Patch
				<VTooltip activator="parent" location="top" max-width="320px"
					>Copy file structure from the selected template part into the selected
					application <strong>with overwriting</strong> existing files in the
					target application part.
				</VTooltip>
			</VBtn>
		</template>
		<VList>
			<VListItem
				v-for="({ title, onClick }, i) in items"
				:key="i"
				:value="i"
				:title="title"
				:disabled="isPending"
				@click="onClick"
			/>
		</VList>
	</VMenu>
</template>

<script lang="ts" setup>
import { usePatchMutation } from "../mutations";
import { useAppsStore } from "../useAppsStore";

const store = useAppsStore();
const { mutate, isPending } = usePatchMutation();

const mutateOptions = {
	onSuccess: () => {
		store.selectedApps = [];
		store.showSuccessSnackbar("Applications patched successfully");
	},
	onError: () => {
		store.showErrorSnackbar("Error patching applications. Check server logs.");
	},
};

const items = [
	{
		title: "All",
		onClick: () =>
			mutate({ apps: store.selectedApps, part: "all" }, mutateOptions),
	},
	{
		title: "Shared",
		onClick: () =>
			mutate({ apps: store.selectedApps, part: "shared" }, mutateOptions),
	},
	{
		title: "Frontend",
		onClick: () =>
			mutate({ apps: store.selectedApps, part: "frontend" }, mutateOptions),
	},
	{
		title: "Backend",
		onClick: () =>
			mutate({ apps: store.selectedApps, part: "backend" }, mutateOptions),
	},
];
</script>
