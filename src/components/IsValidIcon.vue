<template>
	<VIcon
		:icon="valid ? 'mdi-check' : 'mdi-close'"
		:color="valid ? 'success' : 'error'"
	/>
</template>

<script lang="ts" setup>
defineProps<{ valid: boolean }>();
</script>
