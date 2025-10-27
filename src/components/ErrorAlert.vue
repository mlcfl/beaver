<template>
	<VAlert
		v-if="showAlert"
		:text
		:icon="false"
		type="error"
		variant="tonal"
		density="compact"
	/>
</template>

<script lang="ts" setup>
const props = defineProps<{ error?: string | string[] }>();

const showAlert = computed(() => {
	return Boolean(Array.isArray(props.error) ? props.error.length : props.error);
});

const text = computed(() => {
	return Array.isArray(props.error) ? props.error.join(" ") : props.error;
});
</script>
