<script setup>
import {storeToRefs} from "pinia";
import {useStarboardStore} from "@/stores/starboard.store.js";
import VAList from "@/components/va/VAList.vue";

const {VAs, filteredVAs, searchFilter, loadVAsError} = storeToRefs(useStarboardStore());
const {loadVAs} = useStarboardStore()

await loadVAs();
</script>

<template>
	<div class="grid pt-8 px-5">
		<div class="col-12 lg:col-6 lg:col-offset-3">
			<template v-if="!loadVAsError">
				<template v-if="!!VAs.length">
					<div class="p-input-icon-right w-full mb-5">
						<i class="pi pi-search" />
						<InputText v-model="searchFilter" placeholder="Search" class="w-full"/>
					</div>
					<VAList v-show="!!filteredVAs.length"/>
					<div v-if="!!searchFilter && !filteredVAs.length" class="text-center">No matches found</div>
				</template>
				<template v-else>
					<h5 class="text-center">You do not have any VA's. Please add a VA in the backend to get started.</h5>
				</template>
			</template>
			<template v-else>
				<h4 class="text-center">An error occurred while loading VA's. Please contact support.</h4>
			</template>
		</div>
	</div>
</template>

<style scoped>

</style>