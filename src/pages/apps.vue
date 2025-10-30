<style lang="scss" module>
.divider {
	border-right: 1px solid #dddddd;
}

.noPadding {
	padding: 0 !important;
}
</style>

<template>
	<VSheet>
		<h2>Remote Applications</h2>
		<p class="mb-4 text-grey-darken-1">
			List of applications from the official repository that can be downloaded
			and installed.
		</p>
		<VSheet class="mb-4 d-flex justify-end ga-3">
			<VDialog max-width="500">
				<template #activator="{ props: activatorProps }">
					<VBtn
						v-bind="activatorProps"
						variant="outlined"
						:loading="remoteAppsLoading"
						@click="showRemoteApps"
						>Show applications</VBtn
					>
				</template>
				<template #default="{ isActive }">
					<VCard title="Available applications">
						<template #subtitle>
							Click
							<VIcon icon="mdi-download" color="grey-darken-1" />
							to download and install an application
						</template>
						<VCardText>
							<VProgressCircular
								v-if="remoteAppsLoading"
								indeterminate
								color="grey-darken-1"
								class="d-block ma-auto"
							/>
							<VList v-else>
								<VListItem
									v-for="app in remoteAppsList"
									:key="app.appId"
									:title="app.appId"
								>
									<template #append>
										<VBtn
											v-if="!app.downloaded"
											icon="mdi-download"
											variant="text"
											color="grey-darken-1"
											:disabled="isRemoteInstalling"
											:loading="
												remoteAppInstalling === app.appId && isRemoteInstalling
											"
											@click="installRemoteApp(app)"
										/>
										<VIcon
											v-else
											icon="mdi-check"
											color="grey-darken-1"
											class="mr-3"
											title="Already downloaded"
										/>
									</template>
								</VListItem>
							</VList>
						</VCardText>
						<VCardActions>
							<VBtn text="Close" @click="isActive.value = false" />
						</VCardActions>
					</VCard>
				</template>
			</VDialog>
		</VSheet>
		<h2>Local Applications</h2>
		<p class="mb-4 text-grey-darken-1">
			This table displays applications downloaded locally. These can include
			both applications cloned from the official repository and manually created
			ones.
		</p>
		<VSheet class="mb-4 d-flex justify-end ga-3 flex-wrap">
			<ActionPatch />
			<VBtn
				v-if="!runningBackendAppId"
				variant="outlined"
				:disabled="store.selectedApps.length !== 1"
				:loading="isRunningDev"
				@click="runDev('backend')"
				>Run backend (Dev)</VBtn
			>
			<VBtn
				v-else
				variant="outlined"
				:loading="isStoppingDev"
				@click="stopDev('backend')"
				>Stop backend (Dev)</VBtn
			>
			<VBtn
				v-if="!runningFrontendAppId"
				variant="outlined"
				:disabled="store.selectedApps.length !== 1"
				:loading="isRunningDev"
				@click="runDev('frontend')"
				>Run frontend (Dev)</VBtn
			>
			<VBtn
				v-else
				variant="outlined"
				:loading="isStoppingDev"
				@click="stopDev('frontend')"
				>Stop frontend (Dev)</VBtn
			>
			<VBtn
				variant="outlined"
				:disabled="!store.selectedApps.length"
				:loading="isBuilding"
				@click="build"
				>Build</VBtn
			>
			<VBtn
				variant="outlined"
				:disabled="!store.selectedApps.length"
				:loading="isInstalling"
				@click="updateDeps"
				>Install dependencies</VBtn
			>
			<VBtn
				variant="outlined"
				:disabled="!store.selectedApps.length"
				:loading="isLinking"
				@click="updateLinking"
				>Link shared modules</VBtn
			>
		</VSheet>
		<VDataTable
			v-model="store.selectedApps"
			:items="data"
			show-select
			item-value="id"
			:headers="headers"
			:loading="isPending"
			no-data-text="No applications found"
			hide-default-footer
		>
			<template #item.actions="{ item }">
				<VBtn
					icon="mdi-pencil"
					variant="text"
					size="small"
					color="medium-emphasis"
					@click="editApp(item.id)"
				/>
			</template>

			<template #item.deps="{ value }">
				<IsValidIcon :valid="value" />
			</template>

			<template #item.parts.shared="{ value }">
				<IsValidIcon :valid="value" />
			</template>
			<template #item.parts.backend="{ value }">
				<IsValidIcon :valid="value" />
			</template>
			<template #item.parts.frontend="{ value }">
				<IsValidIcon :valid="value" />
			</template>

			<template #item.linking.shared.sharedAll="{ value }">
				<IsValidIcon :valid="value" />
			</template>

			<template #item.linking.backend.sharedAll="{ value }">
				<IsValidIcon :valid="value" />
			</template>
			<template #item.linking.backend.sharedBackend="{ value }">
				<IsValidIcon :valid="value" />
			</template>
			<template #item.linking.backend.sharedLocal="{ value }">
				<IsValidIcon :valid="value" />
			</template>

			<template #item.linking.frontend.sharedAll="{ value }">
				<IsValidIcon :valid="value" />
			</template>
			<template #item.linking.frontend.sharedFrontend="{ value }">
				<IsValidIcon :valid="value" />
			</template>
			<template #item.linking.frontend.sharedLocal="{ value }">
				<IsValidIcon :valid="value" />
			</template>
		</VDataTable>

		<VSnackbar
			v-model="store.snackbar.show"
			:text="store.snackbar.text"
			:color="store.snackbar.color"
			:timeout="3000"
		/>
	</VSheet>
</template>

<script lang="ts" setup>
import { useAppsQuery, useRemoteAppsQuery } from "~/queries";
import {
	useAppsLinkingMutation,
	useAppsInstallMutation,
	useRemoteAppInstall,
	useRunDevServerMutation,
	useStopDevServerMutation,
	useAppsBuildMutation,
} from "~/mutations";
import type { RemoteApp } from "~~/server/api/github/repos";
import ActionPatch from "~/containers/apps/components/ActionPatch.vue";
import { useAppsStore } from "~/containers/apps/useAppsStore";

const store = useAppsStore();
const styles = useCssModule();
const { data, isPending } = useAppsQuery();

const headers = [
	{
		key: "actions",
		align: "center",
		sortable: false,
		headerProps: { class: styles.noPadding },
		cellProps: { class: styles.noPadding },
	},
	{
		title: "ID",
		key: "id",
		fixed: true,
		headerProps: { class: styles.divider },
		cellProps: { class: styles.divider },
	},
	{
		title: "Dependencies are installed for each existing part (node_modules)",
		key: "deps",
		align: "center",
		sortable: false,
		headerProps: { class: styles.divider },
		cellProps: { class: styles.divider },
	},
	{
		title: "Parts",
		align: "center",
		headerProps: { class: styles.divider },
		children: [
			{
				title: "Shared",
				key: "parts.shared",
				width: 50,
				align: "center",
				sortable: false,
			},
			{
				title: "Backend",
				key: "parts.backend",
				width: 50,
				align: "center",
				sortable: false,
			},
			{
				title: "Frontend",
				key: "parts.frontend",
				width: 50,
				align: "center",
				sortable: false,
				headerProps: { class: styles.divider },
				cellProps: { class: styles.divider },
			},
		],
	},
	{
		title: "Shared Linking",
		align: "center",
		headerProps: { class: styles.divider },
		children: [
			{
				title: "@shared/all",
				key: "linking.shared.sharedAll",
				width: 150,
				align: "center",
				sortable: false,
				headerProps: { class: styles.divider },
				cellProps: { class: styles.divider },
			},
		],
	},
	{
		title: "Backend Linking",
		align: "center",
		headerProps: { class: styles.divider },
		children: [
			{
				title: "@shared/all",
				key: "linking.backend.sharedAll",
				width: 150,
				align: "center",
				sortable: false,
			},
			{
				title: "@shared/backend",
				key: "linking.backend.sharedBackend",
				width: 150,
				align: "center",
				sortable: false,
			},
			{
				title: "shared",
				key: "linking.backend.sharedLocal",
				width: 150,
				align: "center",
				sortable: false,
				headerProps: { class: styles.divider },
				cellProps: { class: styles.divider },
			},
		],
	},
	{
		title: "Frontend Linking",
		align: "center",
		children: [
			{
				title: "@shared/all",
				key: "linking.frontend.sharedAll",
				width: 150,
				align: "center",
				sortable: false,
			},
			{
				title: "@shared/frontend",
				key: "linking.frontend.sharedFrontend",
				width: 150,
				align: "center",
				sortable: false,
			},
			{
				title: "shared",
				key: "linking.frontend.sharedLocal",
				width: 150,
				align: "center",
				sortable: false,
			},
		],
	},
] as const;

// Install dependencies
const { mutate: installDeps, isPending: isInstalling } =
	useAppsInstallMutation();
const updateDeps = () => {
	installDeps(store.selectedApps, {
		onSuccess: () => {
			store.selectedApps = [];
			store.showSuccessSnackbar("Installation completed");
		},
		onError: () => {
			store.showErrorSnackbar("Installation error. Check server logs.");
		},
	});
};

// Link application parts
const { mutate: linkApps, isPending: isLinking } = useAppsLinkingMutation();
const updateLinking = () => {
	linkApps(store.selectedApps, {
		onSuccess: () => {
			store.selectedApps = [];
			store.showSuccessSnackbar("Linking completed");
		},
		onError: () => {
			store.showErrorSnackbar("Linking error. Check server logs.");
		},
	});
};

// Edit application
const editApp = (id: string) => {
	console.log(id);
};

// Show remote applications
const {
	data: remoteApps,
	isFetching: remoteAppsLoading,
	refetch: getRemoteApps,
} = useRemoteAppsQuery();

const remoteAppsList = computed(() => {
	if (!remoteApps.value) {
		return [];
	}

	return remoteApps.value.map((app) => ({
		...app,
		// Already downloaded. Can be installed or not installed. Can include all parts or not.
		downloaded: data.value?.some((localApp) => localApp.id === app.appId),
	}));
});

const showRemoteApps = () => {
	if (!remoteApps.value?.length) {
		getRemoteApps();
	}
};

// Install remote application
const remoteAppInstalling = ref<string | null>(null);
const { mutate: installRemote, isPending: isRemoteInstalling } =
	useRemoteAppInstall();
const installRemoteApp = (app: RemoteApp) => {
	remoteAppInstalling.value = app.appId;

	installRemote(app, {
		onSuccess: () => {
			store.showSuccessSnackbar(`Installation completed for "${app.appId}"`);
			remoteAppInstalling.value = null;
		},
		onError: () => {
			store.showErrorSnackbar("Installation error. Check server logs.");
			remoteAppInstalling.value = null;
		},
	});
};

// Run dev server
const runningFrontendAppId = useLocalStorage<string | null | undefined>(
	"runningFrontendAppId",
	null
);
const runningBackendAppId = useLocalStorage<string | null | undefined>(
	"runningBackendAppId",
	null
);

const { mutate: runDevServer, isPending: isRunningDev } =
	useRunDevServerMutation();
const runDev = (part: "frontend" | "backend") => {
	runDevServer(
		{ apps: store.selectedApps, part },
		{
			onSuccess: ({ port }) => {
				if (part === "frontend") {
					runningFrontendAppId.value = store.selectedApps[0];
				} else {
					runningBackendAppId.value = store.selectedApps[0];
				}

				store.selectedApps = [];

				const firstLetter = part.charAt(0).toUpperCase();
				const rest = part.slice(1);
				store.showSuccessSnackbar(
					`${firstLetter}${rest} started on port ${port}`
				);
			},
			onError: () => {
				store.showErrorSnackbar(`Error starting ${part}. Check server logs.`);
			},
		}
	);
};

// Stop dev server
const { mutate: stopDevServer, isPending: isStoppingDev } =
	useStopDevServerMutation();
const stopDev = (part: "frontend" | "backend") => {
	const onSuccess = () => {
		if (part === "frontend") {
			runningFrontendAppId.value = null;
		} else {
			runningBackendAppId.value = null;
		}

		const firstLetter = part.charAt(0).toUpperCase();
		const rest = part.slice(1);
		store.showSuccessSnackbar(`${firstLetter}${rest} stopped successfully`);
	};
	const onError = () => {
		store.showErrorSnackbar(`Error stopping ${part}. Check server logs.`);
	};

	if (part === "frontend" && runningFrontendAppId.value) {
		stopDevServer(
			{ apps: [runningFrontendAppId.value], part },
			{ onSuccess, onError }
		);
	} else if (part === "backend" && runningBackendAppId.value) {
		stopDevServer(
			{ apps: [runningBackendAppId.value], part },
			{ onSuccess, onError }
		);
	}
};

// Build applications
const { mutate: buildApps, isPending: isBuilding } = useAppsBuildMutation();
const build = () => {
	buildApps(store.selectedApps, {
		onSuccess: () => {
			store.selectedApps = [];
			store.showSuccessSnackbar("Build completed");
		},
		onError: () => {
			store.showErrorSnackbar("Build error. Check server logs.");
		},
	});
};
</script>
