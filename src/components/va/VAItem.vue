<script setup>
import heroImage from "@/assets/hero-image.png";

const props = defineProps(['va']);

</script>

<template>
	<div class="grid-view-item">
		<RouterLink class="grid-view-item-body" :to="`/va/${va.code}`">
			<img :src="heroImage" :alt="va.name" class="grid-view-poster-image"/>
		</RouterLink>
		<div class="grid-view-item-title text-sm">
			{{ va.name }}
		</div>
	</div>
</template>

<style scoped>

</style>