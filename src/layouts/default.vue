<template>
	<VLayout min-height="100dvh">
		<VAppBar title="Dashboard" />
		<VNavigationDrawer>
			<VList nav>
				<VListItem
					v-for="(item, i) in items"
					:key="i"
					:value="item"
					:to="item.url"
				>
					<template #prepend>
						<VIcon :icon="item.icon" />
					</template>
					<VListItemTitle>{{ item.label }}</VListItemTitle>
				</VListItem>
			</VList>
		</VNavigationDrawer>
		<VNavigationDrawer location="right">
			<div id="sidebar-right" />
		</VNavigationDrawer>
		<VMain>
			<VContainer>
				<slot />
			</VContainer>
		</VMain>
	</VLayout>
</template>

<script lang="ts" setup>
const items = [
	{
		label: "Applications",
		icon: "mdi-apps",
		url: "/",
	},
	{
		label: "Shared modules",
		icon: "mdi-contain",
		url: "/shared",
	},
	{
		label: "Settings",
		icon: "mdi-cog",
		url: "/settings",
	},
];
</script>
