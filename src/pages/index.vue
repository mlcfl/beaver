<template>
	<VSheet>
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
	</VSheet>
</template>

<script lang="ts" setup>
import { useProjectStructureQuery, useProjectEnvQuery } from "~/queries";
import {
	useFixAppsMutation,
	useFixSharedMutation,
	useFixEntryServerMutation,
} from "~/mutations";

const { data: structure, isSuccess: structureSuccess } =
	useProjectStructureQuery();
const { data: env, isSuccess: envSuccess } = useProjectEnvQuery();

// Fix apps
const { mutate: fixApps, isPending: isFixingApps } = useFixAppsMutation();
// Fix shared
const { mutate: fixShared, isPending: isFixingShared } = useFixSharedMutation();
// Fix entry server
const { mutate: fixEntryServer, isPending: isFixingEntryServer } =
	useFixEntryServerMutation();
</script>
