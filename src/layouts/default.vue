<template>
	<VLayout min-height="100dvh">
		<VAppBar :title="currentPageTitle">
			<template #prepend>
				<VAppBarNavIcon class="d-md-none" @click="drawer = !drawer" />
			</template>
		</VAppBar>
		<VNavigationDrawer v-model="drawer">
			<VList nav>
				<VListItem
					v-for="(item, i) in items"
					:key="i"
					:value="item"
					:to="item.url"
					:disabled="item.disabled"
				>
					<template #prepend>
						<VIcon :icon="item.icon" />
					</template>
					<VListItemTitle>{{ item.label }}</VListItemTitle>
				</VListItem>
			</VList>
		</VNavigationDrawer>
		<VMain>
			<VContainer>
				<slot />
			</VContainer>
		</VMain>
	</VLayout>
</template>

<script lang="ts" setup>
import { useDisplay } from "vuetify";
import { useProjectStructureQuery } from "~/queries";

// Automatically open/close drawer on mobile/desktop
const { mobile } = useDisplay();
const drawer = ref(!mobile.value);

watch(mobile, (isMobile) => {
	drawer.value = !isMobile;
});

// Disable menu items if project structure is invalid
const { data, isFetching } = useProjectStructureQuery();

// Navigation items
const items = computed(() => {
	return [
		{
			label: "Project",
			icon: "mdi-folder-outline",
			url: "/",
		},
		{
			label: "Applications",
			icon: "mdi-apps",
			url: "/apps",
			disabled: isFetching.value || Boolean(data.value?.appsDir.error),
		},
		{
			label: "Shared modules",
			icon: "mdi-contain",
			url: "/shared",
			disabled:
				isFetching.value || Boolean(data.value?.sharedDirs.errors?.length),
		},
		{
			label: "Settings",
			icon: "mdi-cog",
			url: "/settings",
		},
	];
});

// Dynamic page title based on current route
const route = useRoute();
const router = useRouter();

// Watch the route and redirect if there's an error
watch(
	[
		() => route.path,
		() => data.value?.appsDir.error,
		() => data.value?.sharedDirs.errors?.length,
	],
	([path, hasAppsError, hasSharedError]) => {
		// /apps
		if (path === "/apps" && hasAppsError) {
			router.push("/");
		}
		// /shared
		if (path === "/shared" && hasSharedError) {
			router.push("/");
		}
	},
	{ immediate: true }
);

const currentPageTitle = computed(() => {
	const currentItem = items.value.find((item) => item.url === route.path);
	return currentItem?.label ?? "Dashboard";
});

// Update page title dynamically
useHead({
	title: computed(() => `MLC Builder | ${currentPageTitle.value}`),
});
</script>
