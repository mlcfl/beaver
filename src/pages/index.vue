<template>
	<VSheet>
		<OneClickSetup class="mb-4" />

		<DatabaseSetup class="mb-8" />

		<VSheet class="mb-8 d-flex flex-column ga-2">
			<VRow align="center" no-gutters>
				<VBtn
					variant="outlined"
					size="small"
					:loading="isPatchingHosts"
					@click="patchHosts"
					>Patch with hosts</VBtn
				>
				<VBtn
					icon="mdi-information-outline"
					variant="plain"
					size="small"
					class="ml-1 text-grey-darken-1"
				>
					<VIcon icon="mdi-information-outline" size="small" />
					<VTooltip activator="parent" location="top" max-width="320px">
						Writes <strong>mlc.local</strong> entries to the system hosts file
						and updates env files. Requires write access to the hosts file — run
						Beaver with administrator/sudo privileges. Works offline.
					</VTooltip>
				</VBtn>
			</VRow>
			<VRow align="center" no-gutters>
				<VBtn
					variant="outlined"
					size="small"
					:loading="isPatchingDns"
					@click="patchDns"
					>Patch with DNS</VBtn
				>
				<VBtn
					icon="mdi-information-outline"
					variant="plain"
					size="small"
					class="ml-1 text-grey-darken-1"
				>
					<VIcon icon="mdi-information-outline" size="small" />
					<VTooltip activator="parent" location="top" max-width="320px">
						Updates env files to use <strong>localhost.direct</strong> — a
						public DNS service where *.localhost.direct resolves to 127.0.0.1.
						No system modifications needed, but requires a working DNS resolver.
					</VTooltip>
				</VBtn>
			</VRow>
		</VSheet>

		<h2>Environment</h2>
		<VList v-if="envSuccess">
			<VListItem title="Node.js installed" :subtitle="env?.node.value">
				<template #prepend>
					<IsValidIcon :valid="!env?.node.error" />
				</template>
			</VListItem>
			<ErrorAlert :error="env?.node.error" />

			<VListItem title="npm installed" :subtitle="env?.npm.value">
				<template #prepend>
					<IsValidIcon :valid="!env?.npm.error" />
				</template>
			</VListItem>
			<ErrorAlert :error="env?.npm.error" />

			<VListItem title="pnpm installed" :subtitle="env?.pnpm.value">
				<template #prepend>
					<IsValidIcon :valid="!env?.pnpm.error" />
				</template>
			</VListItem>
			<ErrorAlert :error="env?.pnpm.error" />

			<VListItem title="git installed" :subtitle="env?.git.value">
				<template #prepend>
					<IsValidIcon :valid="!env?.git.error" />
				</template>
			</VListItem>
			<ErrorAlert :error="env?.git.error" />
		</VList>

		<h2>Project structure</h2>
		<VList v-if="structureSuccess">
			<VListItem
				:title="`Root directory name is &quot;${structure?.projectName.value}&quot;`"
			>
				<template #prepend>
					<IsValidIcon :valid="!structure?.projectName.error" />
				</template>
			</VListItem>
			<ErrorAlert :error="structure?.projectName.error" />

			<VListItem title="Builder directory exists with the correct path">
				<template #prepend>
					<IsValidIcon :valid="!structure?.builderDir.error" />
				</template>
				<template #append>
					<p v-if="structure?.builderDir.error" class="text-grey-darken-1">
						Are you kidding?
					</p>
				</template>
			</VListItem>
			<ErrorAlert :error="structure?.builderDir.error" />

			<VListItem title="Shared directories exist with correct paths">
				<template #prepend>
					<IsValidIcon :valid="!structure?.sharedDirs.errors?.length" />
				</template>
				<template #append>
					<VBtn
						v-if="structure?.sharedDirs.errors?.length"
						variant="outlined"
						:loading="isFixingShared"
						@click="fixShared"
						>Fix</VBtn
					>
				</template>
			</VListItem>
			<ErrorAlert :error="structure?.sharedDirs.errors" />

			<VListItem title="Applications directory exists with the correct path">
				<template #prepend>
					<IsValidIcon :valid="!structure?.appsDir.error" />
				</template>
				<template #append>
					<VBtn
						v-if="structure?.appsDir.error"
						variant="outlined"
						:loading="isFixingApps"
						@click="fixApps"
						>Fix</VBtn
					>
				</template>
			</VListItem>
			<ErrorAlert :error="structure?.appsDir.error" />

			<h3>Local development or use on a local computer</h3>
			<VListItem title="Entry server directory exists with the correct path">
				<template #prepend>
					<IsValidIcon :valid="!structure?.entryServerDir.error" />
				</template>
				<template #append>
					<VBtn
						v-if="structure?.entryServerDir.error"
						variant="outlined"
						:loading="isFixingEntryServer"
						@click="fixEntryServer"
						>Fix</VBtn
					>
				</template>
			</VListItem>
			<ErrorAlert :error="structure?.entryServerDir.error" />
		</VList>

		<VSnackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
			{{ snackbar.text }}
		</VSnackbar>
	</VSheet>
</template>

<script lang="ts" setup>
import { FetchError } from "ofetch";
import { useProjectStructureQuery, useProjectEnvQuery } from "~/queries";
import {
	useFixAppsMutation,
	useFixSharedMutation,
	useFixEntryServerMutation,
	usePatchHostsMutation,
	usePatchDnsMutation,
} from "~/mutations";
import { OneClickSetup, DatabaseSetup } from "~/containers/project/components";

const { data: structure, isSuccess: structureSuccess } =
	useProjectStructureQuery();
const { data: env, isSuccess: envSuccess } = useProjectEnvQuery();

// Snackbar
const snackbar = reactive({
	show: false,
	text: "",
	color: "success" as "success" | "error",
});
const showSnackbar = (text: string, color: "success" | "error") => {
	snackbar.text = text;
	snackbar.color = color;
	snackbar.show = true;
};

const getErrorMessage = (e: unknown): string => {
	if (e instanceof FetchError) {
		return e.data?.statusMessage ?? e.message;
	}

	if (e instanceof Error) {
		return e.message;
	}

	return String(e);
};

// Fix apps
const { mutate: fixApps, isPending: isFixingApps } = useFixAppsMutation();
// Fix shared
const { mutate: fixShared, isPending: isFixingShared } = useFixSharedMutation();
// Fix entry server
const { mutate: fixEntryServer, isPending: isFixingEntryServer } =
	useFixEntryServerMutation();

// Patch with hosts (mlc.local)
const { mutate: patchHosts, isPending: isPatchingHosts } =
	usePatchHostsMutation({
		onSuccess: () =>
			showSnackbar(
				"Hosts file patched. Restart entry-server for changes to take effect.",
				"success",
			),
		onError: (e) => showSnackbar(getErrorMessage(e), "error"),
	});

// Patch with DNS (localhost.direct)
const { mutate: patchDns, isPending: isPatchingDns } = usePatchDnsMutation({
	onSuccess: () =>
		showSnackbar(
			"Env files updated to use localhost.direct. Restart entry-server for changes to take effect.",
			"success",
		),
	onError: (e) => showSnackbar(getErrorMessage(e), "error"),
});
</script>
