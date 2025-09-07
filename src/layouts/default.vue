<style lang="scss" module>
.main {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100vw;
	width: 100dvw;
	height: 100vh;
	height: 100dvh;
}
</style>

<template>
	<main :class="$style.main">
		<slot />
	</main>
</template>
