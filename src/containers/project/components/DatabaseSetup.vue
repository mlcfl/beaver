<template>
	<VSheet>
		<h2 class="mb-2">Databases</h2>
		<VSheet class="d-flex flex-column ga-2">
			<!-- PostgreSQL -->
			<VRow align="center" no-gutters>
				<VBtn variant="outlined" size="small" @click="pgDialog = true"
					>Setup PostgreSQL</VBtn
				>
				<VChip
					class="ml-2"
					:color="status?.postgres ? 'success' : 'default'"
					size="small"
					variant="outlined"
				>
					{{ status?.postgres ? "Configured" : "Not configured" }}
				</VChip>
			</VRow>

			<!-- MongoDB -->
			<VRow align="center" no-gutters>
				<VBtn variant="outlined" size="small" @click="mongoDialog = true"
					>Setup MongoDB</VBtn
				>
				<VChip
					class="ml-2"
					:color="status?.mongo ? 'success' : 'default'"
					size="small"
					variant="outlined"
				>
					{{ status?.mongo ? "Configured" : "Not configured" }}
				</VChip>
			</VRow>
		</VSheet>

		<!-- PostgreSQL Dialog -->
		<VDialog v-model="pgDialog" max-width="480">
			<VCard>
				<VCardTitle>Setup PostgreSQL</VCardTitle>
				<VCardText>
					<template v-if="pgState === 'idle'">
						<p class="mb-3">
							User <strong>mlc</strong> with password <strong>mlc</strong> and
							database <strong>mlc</strong> will be created. Connection strings
							in env files will be updated automatically.
						</p>
						<VAlert type="warning" variant="tonal" density="compact" class="mb-3">
							<strong>Run Beaver as administrator</strong> — required to execute
							psql commands correctly.
						</VAlert>
						<p class="mb-4">
							1. Install PostgreSQL if not already installed:
							<a
								href="https://www.postgresql.org/download/"
								target="_blank"
								rel="noopener"
								>postgresql.org/download</a
							>
						</p>
						<p class="mb-2 text-body-2 text-grey-darken-1">
							2. If you set a password for the <code>postgres</code> superuser
							during installation, enter it below:
						</p>
						<VTextField
							v-model="pgPassword"
							label="postgres password (if any)"
							type="password"
							variant="outlined"
							density="compact"
							hide-details
							class="mb-4"
						/>
						<p>3. Click the button below:</p>
					</template>

					<template v-else-if="pgState === 'loading'">
						<div class="d-flex align-center ga-3">
							<VProgressCircular indeterminate size="24" />
							<span>Creating user mlc and database mlc...</span>
						</div>
					</template>

					<template v-else-if="pgState === 'success'">
						<div class="d-flex align-center ga-2 text-success">
							<VIcon icon="mdi-check-circle" />
							<span
								>PostgreSQL configured. Connection strings updated in env
								files.</span
							>
						</div>
					</template>

					<template v-else-if="pgState === 'error'">
						<div class="d-flex align-start ga-2 text-error">
							<VIcon icon="mdi-alert-circle" class="mt-1" />
							<span>{{ pgError }}</span>
						</div>
					</template>
				</VCardText>

				<VCardActions>
					<VSpacer />
					<template v-if="pgState === 'idle' || pgState === 'error'">
						<VBtn variant="text" @click="closePgDialog">Close</VBtn>
						<VBtn color="primary" variant="flat" @click="runPgSetup">
							{{ pgState === "error" ? "Retry" : "I installed PostgreSQL" }}
						</VBtn>
					</template>
					<template v-else-if="pgState === 'success'">
						<VBtn color="primary" variant="flat" @click="closePgDialog"
							>Close</VBtn
						>
					</template>
				</VCardActions>
			</VCard>
		</VDialog>

		<!-- MongoDB Dialog -->
		<VDialog v-model="mongoDialog" max-width="480">
			<VCard>
				<VCardTitle>Setup MongoDB</VCardTitle>
				<VCardText>
					<template v-if="mongoState === 'idle'">
						<p class="mb-3">The following will be done automatically:</p>
						<ol class="mb-3 pl-4">
							<li>Enable replica set in mongod config (required for Prisma)</li>
							<li>Restart the MongoDB service</li>
							<li>Initiate the replica set (<code>rs.initiate()</code>)</li>
							<li>
								Create user <strong>mlc</strong> and database
								<strong>mlc</strong>
							</li>
							<li>Update connection strings in env files</li>
						</ol>
						<VAlert
							type="warning"
							variant="tonal"
							density="compact"
							class="mb-4"
						>
							Administrator privileges are required (writing to the mongod
							config and restarting the service). Run Beaver as administrator.
						</VAlert>
						<p class="mb-4">
							1. Install MongoDB Community Server if not already installed:
							<a
								href="https://www.mongodb.com/try/download/community"
								target="_blank"
								rel="noopener"
								>mongodb.com/try/download/community</a
							>
						</p>
						<p>2. Click the button below:</p>
					</template>

					<template v-else-if="mongoState === 'loading'">
						<div class="d-flex align-center ga-3">
							<VProgressCircular indeterminate size="24" />
							<span>Setting up MongoDB... (may take ~15 seconds)</span>
						</div>
					</template>

					<template v-else-if="mongoState === 'success'">
						<div class="d-flex align-center ga-2 text-success">
							<VIcon icon="mdi-check-circle" />
							<span
								>MongoDB configured. Connection strings updated in env
								files.</span
							>
						</div>
					</template>

					<template v-else-if="mongoState === 'error'">
						<div class="d-flex align-start ga-2 text-error">
							<VIcon icon="mdi-alert-circle" class="mt-1" />
							<span>{{ mongoError }}</span>
						</div>
					</template>
				</VCardText>

				<VCardActions>
					<VSpacer />
					<template v-if="mongoState === 'idle' || mongoState === 'error'">
						<VBtn variant="text" @click="closeMongoDialog">Close</VBtn>
						<VBtn color="primary" variant="flat" @click="runMongoSetup">
							{{ mongoState === "error" ? "Retry" : "I installed MongoDB" }}
						</VBtn>
					</template>
					<template v-else-if="mongoState === 'success'">
						<VBtn color="primary" variant="flat" @click="closeMongoDialog"
							>Close</VBtn
						>
					</template>
				</VCardActions>
			</VCard>
		</VDialog>
	</VSheet>
</template>

<script lang="ts" setup>
import { useQueryClient } from "@tanstack/vue-query";
import { FetchError } from "ofetch";
import { useDatabaseStatusQuery } from "~/queries";
import { usePostgresSetupMutation, useMongoSetupMutation } from "~/mutations";

type DialogState = "idle" | "loading" | "success" | "error";

const queryClient = useQueryClient();
const { data: status } = useDatabaseStatusQuery();

// PostgreSQL dialog
const pgDialog = ref(false);
const pgState = ref<DialogState>("idle");
const pgError = ref("");
const pgPassword = ref("");

const { mutate: setupPostgres } = usePostgresSetupMutation({
	onSuccess: () => {
		pgState.value = "success";
		queryClient.invalidateQueries({ queryKey: ["databaseStatus"] });
	},
	onError: (e) => {
		pgState.value = "error";
		pgError.value = getErrorMessage(e);
	},
});

const runPgSetup = () => {
	pgState.value = "loading";
	setupPostgres(pgPassword.value);
};

const closePgDialog = () => {
	pgDialog.value = false;
	pgState.value = "idle";
	pgError.value = "";
	pgPassword.value = "";
};

// MongoDB dialog
const mongoDialog = ref(false);
const mongoState = ref<DialogState>("idle");
const mongoError = ref("");

const { mutate: setupMongo } = useMongoSetupMutation({
	onSuccess: () => {
		mongoState.value = "success";
		queryClient.invalidateQueries({ queryKey: ["databaseStatus"] });
	},
	onError: (e) => {
		mongoState.value = "error";
		mongoError.value = getErrorMessage(e);
	},
});

const runMongoSetup = () => {
	mongoState.value = "loading";
	setupMongo();
};

const closeMongoDialog = () => {
	mongoDialog.value = false;
	mongoState.value = "idle";
	mongoError.value = "";
};

// Utils
const getErrorMessage = (e: unknown): string => {
	if (e instanceof FetchError) {
		return e.data?.message ?? e.message;
	}
	if (e instanceof Error) return e.message;
	return String(e);
};
</script>
