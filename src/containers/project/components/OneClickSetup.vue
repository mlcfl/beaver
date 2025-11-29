<style lang="scss" module>
$mb: 4px;

.console {
	$font-size: 0.875rem;
	$line-height: 1.5;
	$rows: 5;

	font: #{$font-size} / #{$line-height} monospace;
	height: calc(($rows * $font-size * $line-height) + ($rows * $mb));
	overflow-y: auto;
	overscroll-behavior-y: none;
}

.output {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	margin-bottom: $mb;
	white-space: pre-wrap;
	word-break: break-word;
}

.icon {
	flex-shrink: 0;
	margin-top: 2px;
}

.outputSuccess {
	color: rgb(var(--v-theme-success));
}

.outputError {
	color: rgb(var(--v-theme-error));
}
</style>

<template>
	<VSheet>
		<VBtn
			prepend-icon="mdi-magic-staff"
			variant="outlined"
			size="small"
			class="mb-4"
			:loading="isRunning"
			:disabled="isRunning"
			@click="handleOneClickSetup"
			>One-click setup from scratch</VBtn
		>
		<VSheet variant="outlined" class="pa-2" border rounded>
			<VSheet ref="output" :class="$style.console">
				<div
					v-for="({ type, text }, i) in messages"
					:key="i"
					:class="[
						$style.output,
						{
							[$style.outputError]: type === 'error',
							[$style.outputSuccess]: type === 'success',
						},
					]"
				>
					<VIcon
						v-if="type === 'success'"
						icon="mdi-check"
						size="small"
						:class="$style.icon"
					/>
					<VIcon
						v-if="type === 'error'"
						icon="mdi-close"
						size="small"
						:class="$style.icon"
					/>
					<span>{{ text }}</span>
				</div>
			</VSheet>
		</VSheet>
	</VSheet>
</template>

<script lang="ts" setup>
import { FetchError } from "ofetch";
import { useRemoteAppsQuery } from "~/queries";
import {
	useFixAppsMutation,
	useFixSharedMutation,
	useFixEntryServerMutation,
	useSharedBuildMutation,
	useEntryServerBuildMutation,
	useRemoteAppInstall,
	useJwtCreateMutation,
	usePepperCreateMutation,
} from "~/mutations";
import { useBuildMutation } from "~/containers/apps/mutations";

type MessageType = "info" | "success" | "error";

type Message = {
	text: string;
	type: MessageType;
};

const isRunning = ref(false);
const output = useTemplateRef("output");
const messages = ref<Message[]>([]);

// Steps
const { mutateAsync: createAppsDir } = useFixAppsMutation();
const { mutateAsync: cloneSharedDir } = useFixSharedMutation();
const { mutateAsync: cloneEntryServerDir } = useFixEntryServerMutation();
const { mutateAsync: buildSharedDir } = useSharedBuildMutation();
const { mutateAsync: buildEntryServer } = useEntryServerBuildMutation();
const { data: remoteApps, refetch: getRemoteApps } = useRemoteAppsQuery();
const { mutateAsync: installApp } = useRemoteAppInstall();
const { mutateAsync: buildApp } = useBuildMutation();
const { mutateAsync: createJwtKeys } = useJwtCreateMutation();
const { mutateAsync: createPepperKey } = usePepperCreateMutation();

// Auto scroll to bottom in output console
const scrollToBottom = async () => {
	await nextTick();

	const element = output.value?.$el;

	if (!(element instanceof HTMLElement)) {
		return;
	}

	element.scrollTop = element.scrollHeight;
};

watch(messages, scrollToBottom, { deep: true });

// Add message to output console
const appendOutput = (text: string, type: MessageType = "info") => {
	messages.value.push({ text, type });

	return { push: appendOutput };
};

/**
 * Main handler
 */
const handleOneClickSetup = async () => {
	isRunning.value = true;
	messages.value = [];
	const w = appendOutput;

	try {
		/**
		 * 1. Setup shared-* modules
		 */
		w("Setting up /shared directory...");
		await cloneSharedDir();
		w("/shared directory created")
			.push("/shared-all repository cloned")
			.push("/shared-backend repository cloned")
			.push("/shared-frontend repository cloned")
			.push("Dependencies installed for /shared-all repository")
			.push("Dependencies installed for /shared-backend repository")
			.push("Dependencies installed for /shared-frontend repository");
		w("Building shared modules...");
		await buildSharedDir("all");
		w("/shared-all module built");
		await buildSharedDir("frontend");
		w("/shared-frontend module built");
		await buildSharedDir("backend");
		w("/shared-backend module built");

		/**
		 * 2. Setup /apps directory
		 */
		w("\nSetting up /apps directory...");
		await createAppsDir();
		w("/apps directory created");
		w("Getting the list of available applications...");
		await getRemoteApps();
		const appsArray = remoteApps.value ?? [];
		const appIds = appsArray.map(({ appId }) => appId).join(", ");
		w(`Available applications fetched: ${appIds}`);
		for (const remoteApp of appsArray) {
			w(`Installing "${remoteApp.appId}"...`);
			await installApp(remoteApp);
			w(`All parts for "${remoteApp.appId}" cloned`)
				.push(`Dependencies installed for all parts of "${remoteApp.appId}"`)
				.push(".env files created based on .env.example");
			w(`Building "${remoteApp.appId}"...`);
			await buildApp({ apps: [remoteApp.appId], part: "all" });
			w(`"${remoteApp.appId}" built`);
		}

		/**
		 * 3. Setup /entry-server directory
		 */
		w("\nSetting up /entry-server directory...");
		await cloneEntryServerDir();
		w("/entry-server repository cloned")
			.push(".env files created based on .env.example")
			.push("Dependencies installed for /entry-server repository")
			.push("Building entry server module...");
		await buildEntryServer();
		w("/entry-server module built");

		/**
		 * 4. Create JWT keys, save them in each /[app]-backend and in /entry-server
		 */
		w("\nCreating JWT private and public keys...");
		await createJwtKeys(appsArray.map(({ appId }) => appId));
		w("JWT keys created and saved in appropriate directories");

		/**
		 * 5. Create pepper key, save it in /auth-backend and /entry-server
		 */
		w("\nCreating pepper key...");
		await createPepperKey();
		w(
			"Pepper key created, saved in /auth-backend and /entry-server .env files"
		);

		// Final success message
		w(" ")
			.push("All steps completed successfully!", "success")
			.push(
				'Project installation and setup completed. To run the project now and in the future, go to entry-server directory and use the command "pnpm start" to launch it.',
				"success"
			);
	} catch (e) {
		const errorMessage =
			e instanceof FetchError
				? e.data.message
				: e instanceof Error
				? e.message
				: String(e);

		// Error message
		w(" ").push(`Error: ${errorMessage}`, "error");
	}

	isRunning.value = false;
};
</script>
