<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
	export default {
		name: "App",
	};
</script>

<style lang="less" scoped>
	#app {
		width: 100%;
		height: 100%;
		min-width: 1100px;
		min-height: 500px;
	}
</style>
