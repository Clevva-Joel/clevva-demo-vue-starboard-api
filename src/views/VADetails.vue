<script setup>
import {v4 as uuidv4} from 'uuid';
import heroImage from "@/assets/hero-image.png";
import {useStarboardStore} from "@/stores/starboard.store.js";
import {storeToRefs} from "pinia";
import {computed} from "vue";
import RealtimeText from "@/components/RealtimeText.vue";

const {va} = defineProps(['va']);

const {recentSessions, sessionData} = storeToRefs(useStarboardStore());
const {removeSession} = useStarboardStore();
const vaSessions = computed(() => recentSessions.value[va.code] || []);

const handleStop = (sessionCode) => {
	removeSession(sessionCode);
}

window.scrollTo(0, 0)
</script>

<template>
	<div class="grid md:pt-6 md:px-5">
		<div class="col-12 md:col-6 md:col-offset-2 lg:col-4 lg:col-offset-3">
			<Card>
				<template #header>
					<img
						class="mx-auto block"
						style="max-height: 320px"
						:alt="va.name"
						:src="heroImage"
					/>
				</template>
				<template #title>{{ va.name }}</template>
				<template #content v-if="va.description">
					<pre class="m-0" style="white-space: pre-line">
						{{ va.description }}
					</pre>
				</template>
				<template #footer>
					<div class="flex gap-3 mt-1">
						<RouterLink :to="`/va/${va.code}/run/${uuidv4()}`" class="block w-full">
							<Button class="w-full justify-content-center">Run</Button>
						</RouterLink>
					</div>
				</template>
			</Card>
		</div>
		<div class="col-12 md:col-4 lg:col-4">
			<Card>
				<template #title>Recent sessions{{ !!vaSessions.length ? ` (${vaSessions.length})` : '' }}</template>
				<template #content>
					<div :key="session.sessionCode" v-for="session in vaSessions">
						<div class="flex align-items-center">
							<RealtimeText :dateTime="session.datetime" :dateTimeFormat="'YYYY-MM-DD HH:mm:ss'" class="flex-grow-1"/>
							<div class="flex-grow-0 flex align-items-center">
								<div v-if="!session.extra.ranToEnd" class="flex align-items-center">
									<RouterLink :to="`/va/${va.code}/run/${session.extra.sessionCode}`">
										<Button
											class="btn btn-xs bg-blue-400 border-blue-400 hover:bg-blue-300 hover:border-blue-300 mr-1">
											Resume
										</Button>
									</RouterLink>
									<Button @click="handleStop(session.extra.sessionCode)"
											class="btn btn-xs bg-red-500 border-red-500 hover:bg-red-400 hover:border-red-400">
										Stop
									</Button>
								</div>
								<RouterLink v-else :to="`/va/${va.code}/run/${session.extra.sessionCode}`">
									<Button class="btn btn-xs">View</Button>
								</RouterLink>
							</div>
						</div>
						<hr>
					</div>
				</template>
			</Card>
		</div>
	</div>
</template>

<style scoped>

</style>