<template>
	<VSheet>
		<VDataTable
			v-model="selected"
			:items="data?.data ?? []"
			show-select
			item-value="name"
			:headers="headers"
			:loading="status === 'pending'"
		/>
	</VSheet>
</template>

<script lang="ts" setup>
const { data, status } = await useFetch("/api/apps");
const selected: Ref<{ name: string }[]> = ref([]);
const headers = [{ title: "Name", key: "name" }];
</script>
