<script setup>
import {useStarboardStore} from "@/stores/starboard.store.js";
import {storeToRefs} from "pinia";
import VAItem from "@/components/va/VAItem.vue";

const { filteredVAs } = storeToRefs(useStarboardStore());

</script>

<template>
	<div class="grid-view">
		<VAItem :key="va.code" v-for="va in filteredVAs" :va="va"/>
	</div>
</template>

<style scoped>
.grid-view-item {
	border: 1px solid #333333;
	background-color: rgba(13, 13, 13, 0.8);
}

@media (min-width: 640px) {
	.grid-view {
		grid-template-columns: repeat(2, 1fr);
	}
}
@media (min-width: 768px) {
	.grid-view {
		grid-template-columns: repeat(3, 1fr);
	}
	.grid-view-item {
		height: 156px;
	}
}
@media (min-width: 991px) {
	.grid-view-item {
		height: 192px;
	}
}
@media (min-width: 1200px) {
	.grid-view {
		grid-template-columns: repeat(3, 1fr);
	}
}
</style>