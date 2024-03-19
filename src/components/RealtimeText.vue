<script setup>
import moment from "moment";
import {onBeforeMount, onUnmounted, ref} from "vue";

const {dateTime, dateTimeFormat} = defineProps(['dateTime', 'dateTimeFormat']);

const syncedDateTime = ref(moment(dateTime, dateTimeFormat || 'YYYY-MM-DD HH:mm:ss').fromNow());

let timeInterval = setInterval(() => {
	syncedDateTime.value = moment(dateTime, dateTimeFormat || 'YYYY-MM-DD HH:mm:ss').fromNow();
}, 1000);

onUnmounted(() => {
	clearInterval(timeInterval);
})
</script>

<template>
	<span>
		<slot :dateTimeText="syncedDateTime">
			{{ syncedDateTime }}
		</slot>
	</span>
</template>

<style scoped>

</style>