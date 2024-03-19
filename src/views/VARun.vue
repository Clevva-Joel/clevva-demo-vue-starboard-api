<script setup>
import * as starboardService from "@/services/starboard.service.js";
import {useStarboardStore} from "@/stores/starboard.store.js";
import {storeToRefs} from "pinia";
import lodash from "lodash";
import {v4 as uuidv4} from 'uuid';
import {useRouter} from "vue-router";
import {ref, watch} from "vue";

const router = useRouter();

const {va, sessionCode} = defineProps(['va', 'sessionCode']);

const {setSession, removeSession} = useStarboardStore();
const {sessionData} = storeToRefs(useStarboardStore());

if (!sessionData.value[sessionCode]) {
	const stateData = await starboardService.startVA(va.code);
	setSession(va.code, sessionCode, stateData.states);
}

const mapStateData = (stateData, forRender = true) => {
	if (stateData.type == 'step' && stateData.form?.fields) {
		stateData.form.fields = stateData.form.fields.map(ff => {
			if (ff.type == 'checkbox') {
				if (forRender) {
					ff.value = (ff.value == 'Checked');
				} else {
					ff.value = ff.value ? 'Checked' : 'Unchecked';
				}
			}
			return ff;
		});
	}
	return stateData;
}
const session = ref(sessionData.value[sessionCode] || {});
watch(sessionData.value[sessionCode], () => {
	if (!!sessionData.value[sessionCode]) {
		const sd = lodash.cloneDeep(sessionData.value[sessionCode]);
		sd.states = sd.states.map(s => {
			s.load_data = mapStateData(s.load_data);
			return s;
		});
		session.value = sd;
	}
});

const formFieldTypes = [
	'text',
	'textarea',
	'numeric',
	'combosingle',
	'combomulti',
	'checkbox',
	'label',
	'header'
];

const isProcessing = ref(false);
const hasError = ref(false);

const handleAction = async (stateData) => {
	try {
		stateData = mapStateData(stateData, false);
		let action = null;
		if (stateData.type == 'step') {
			action = stateData.button.action;
			if (stateData.form?.fields) {
				action.form = stateData.form;
			}
		} else if (stateData.type == 'decision') {
			if (stateData.data.type == 'button') {
				action = stateData.data.answers.find(a => a.flags?.chosen)?.action;
			} else if (stateData.data.type == 'checkbox') {
				action = stateData.data.action.action;
			}
		}

		if (!!action) {
			isProcessing.value = true;
			hasError.value = false;
			const stateData = await starboardService.triggerAction({action});
			setSession(va.code, sessionCode, stateData.states);
		} else {
			throw new Error("Invalid action provided");
		}
	} catch (error) {
		console.log(error)
		hasError.value = true;
	} finally {
		isProcessing.value = false;
		document.getElementById('journeyScrollTracker')?.scrollIntoView();
	}
}

const handleRerun = () => {
	router.replace({path: `/va/${va.code}/run/${uuidv4()}`, force: true});
	removeSession(sessionCode);
}

const handleStop = () => {
	router.replace({path: `/va/${va.code}`});
	removeSession(sessionCode);
}
</script>

<template>
	<div class="grid pt-6 px-5 pb-5 relative">
		<div class="col-12 lg:col-6 lg:col-offset-3">
			<div class="flex mb-5 border-1 border-primary bg-white text-black-alpha-90" style="border-radius: 6px;">
				<div class="flex flex-grow-0 align-items-center">
					<RouterLink :to="`/va/${va.code}`">
						<Button
							icon="pi pi-arrow-left"
							class="btn btn-sm"
							style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
							title="Back"/>
					</RouterLink>
				</div>
				<h3
					style="border-top-right-radius: 6px; border-bottom-right-radius: 6px;"
					class="flex flex-grow-1 align-items-center justify-content-center my-0"
				>
					{{ va.name }}
				</h3>
				<div v-if="!session.ranToEnd" class="flex flex-grow-0 align-items-center pr-2">
					<Button
						icon="pi pi-stop"
						class="btn btn-xs-square btn-rounded text-white bg-red-600 border-red-600 hover:bg-red-500 hover:border-red-500"
						style="border-radius: 50%"
						title="Rerun"
						@click="handleStop"/>
					<Button
						icon="pi pi-play"
						class="btn btn-xs-square btn-rounded ml-1 text-white bg-blue-600 border-blue-600 hover:bg-blue-400 hover:border-blue-400"
						style="border-radius: 50%"
						title="Rerun"
						@click="handleRerun"/>
				</div>
			</div>
			<template :key="stateIndex" v-for="(state, stateIndex) in session.states">
				<Card v-if="state.load_data.type != 'summary'" class="mb-4">
					<template #title>
						<h4 class="mt-0">{{ state.load_data.title }}</h4>
					</template>
					<template #content>
						<div v-if="!!state.load_data.wysiwyg && state.load_data.wysiwyg != '<br>'" v-html="state.load_data.wysiwyg"></div>
						<div v-if="!!state.load_data.body" v-html="state.load_data.body"></div>
						<form
							v-if="state.load_data.type == 'step'"
							:class="{'mt-4': (!!state.load_data.wysiwyg && state.load_data.wysiwyg != '<br>') || (!!state.load_data.body)}"
							@submit.prevent="handleAction(state.load_data)"
							>
							<div  v-if="!!state.load_data.form?.fields">
								<template :key="formFieldIndex"
										  v-for="(formField, formFieldIndex) in state.load_data.form.fields.filter(f => formFieldTypes.includes(f.type))">
									<div class="mb-5">
										<template v-if="!['label', 'header'].includes(formField.type)">
											<label
												v-if="formField.type != 'checkbox'"
												:for="`form_field_${formField.formfieldid}`"
												class="mb-3 font-semibold">
												{{ formField.label }}
												<span v-if="formField.required" class="text-red-600">&nbsp;*</span>
											</label>
											<div>
												<InputText
													v-if="formField.type == 'text'"
													v-model="session.states[stateIndex].load_data.form.fields[formFieldIndex].value"
													:inputId="`form_field_${formField.formfieldid}`"
													:disabled="isProcessing || !!state.action_data?.actionid"
													:required="formField.required"
													class="w-full md:w-24rem lg:w-24rem"
												/>
												<InputNumber
													v-if="formField.type == 'numeric'"
													v-model="session.states[stateIndex].load_data.form.fields[formFieldIndex].value"
													:inputId="`form_field_${formField.formfieldid}`"
													:format="false"
													:disabled="isProcessing || !!state.action_data?.actionid"
													:required="formField.required"
													:maxFractionDigits="20"
													class="w-full md:w-24rem lg:w-24rem"
												/>
												<Textarea
													v-if="formField.type == 'textarea'"
													v-model="session.states[stateIndex].load_data.form.fields[formFieldIndex].value"
													:inputId="`form_field_${formField.formfieldid}`"
													:disabled="isProcessing || !!state.action_data?.actionid"
													:required="formField.required"
													class="w-full md:w-24rem lg:w-24rem"
													rows="3"
												/>
												<Dropdown
													v-else-if="formField.type == 'combosingle'"
													v-model="session.states[stateIndex].load_data.form.fields[formFieldIndex].selected"
													:inputId="`form_field_${formField.formfieldid}`"
													:options="formField.data"
													:disabled="isProcessing || !!state.action_data?.actionid"
													:required="formField.required"
													optionLabel="text"
													placeholder="Please select"
													class="w-full md:w-24rem lg:w-24rem"
												/>
												<MultiSelect
													v-else-if="formField.type == 'combomulti'"
													v-model="session.states[stateIndex].load_data.form.fields[formFieldIndex].selected"
													display="chip"
													:options="formField.data"
													:readonly="isProcessing || !!state.action_data?.actionid"
													:required="formField.required"
													optionLabel="text"
													placeholder="Please select"
													:maxSelectedLabels="20"
													class="w-full md:w-24rem lg:w-24rem"
												/>
												<div
													v-else-if="formField.type == 'checkbox'"
													class="flex align-items-center">
													<Checkbox
														v-model="session.states[stateIndex].load_data.form.fields[formFieldIndex].value"
														:inputId="`form_field_${formField.formfieldid}`"
														:disabled="isProcessing || !!state.action_data?.actionid"
														:readonly="!!state.action_data?.actionid"
														:required="formField.required"
														:binary="true"
														class="flex-grow-0"
													/>
													<label
														:for="`${state.load_data.id}_checkbox_${answerIndex}`"
														class="flex-grow-1 pl-2 font-semibold">
														{{ formField.label }}
														<span v-if="formField.required" class="text-red-600">&nbsp;*</span>
													</label>
												</div>
											</div>
										</template>
										<template v-else>
											<div class="mb-3">{{ formField.label }}</div>
										</template>
									</div>
								</template>
							</div>
							<Button
								v-if="!state.action_data?.actionid"
								type="submit"
								class="mt-3"
								:disabled="isProcessing">
								Next
							</Button>
						</form>
						<div v-if="state.load_data.type == 'decision'" class="flex flex-row gap-2">
							<template v-if="state.load_data.data.type == 'button'">
								<Button
									:key="answerIndex"
									v-for="(answer, answerIndex) in state.load_data.data.answers"
									class="decision-button"
									:class="{'active': answer.flags?.chosen}"
									:disabled="session.ranToEnd || isProcessing"
									@click="() => {
										session.states[stateIndex].load_data.data.answers.forEach((a, i) => {
											session.states[stateIndex].load_data.data.answers[i].flags.chosen = (i == answerIndex);
										});
										handleAction(state.load_data);
									}"
									>
									{{ answer.title }}
								</Button>
							</template>
							<template v-else-if="state.load_data.data.type == 'checkbox'">
								<form
									@submit.prevent="handleAction(state.load_data)"
									class="flex flex-column">
									<div
										:key="answerIndex"
										v-for="(answer, answerIndex) in state.load_data.data.answers"
										class="flex align-items-center mb-2 flex-grow-1"
										>
										<Checkbox
											v-model="session.states[stateIndex].load_data.data.action.action.factorvalueids"
											:inputId="`${state.load_data.id}_checkbox_${answerIndex}`"
											:name="`${state.load_data.id}_checkbox`"
											:value="answer.factor.factorvalueid"
											:disabled="session.ranToEnd || isProcessing"
											class="decision-checkbox flex-grow-0"
										/>
										<label
											:for="`${state.load_data.id}_checkbox_${answerIndex}`"
											class="flex-grow-1 pl-2">
											{{ answer.title }}
										</label>
									</div>
									<div class="flex-grow-0">
										<Button
											type="submit"
											class="mt-3"
											:disabled="!(!session.ranToEnd && !!state.load_data.data.answers.filter(a => state.load_data.data.action.action.factorvalueids.includes(a.factor.factorvalueid)).length) || isProcessing"
											>
											Next
										</Button>
									</div>
								</form>
							</template>
						</div>
					</template>
				</Card>
			</template>
			<ProgressBar v-if="isProcessing" mode="indeterminate" class="mx-auto" style="width:50%; height: 8px"/>
			<div v-if="hasError" class="mx-auto text-red-600 text-center" style="width:50%; height: 8px">An error occurred</div>
			<div id="journeyScrollTracker"></div>
		</div>
	</div>
</template>

<style scoped>
.p-card.p-component > .p-card-body > .p-card-caption > .p-card-title > h5 {
	margin-top: 0 !important;
	margin-bottom: 0 !important;
}

.decision-button {
	border: 1px solid var(--primary-color);
	border-radius: var(--border-radius);
	padding: 0.5rem 1rem;
	font-size: 1rem;
	cursor: pointer
}

body[data-theme="light"] .decision-button {
	background-color: white;
	color: black;
}

body[data-theme="dark"] .decision-button {
	background-color: black;
	color: white;
}

body:is([data-theme="light"], [data-theme="dark"]) .decision-button.active {
	background-color: var(--primary-color);
	color: var(--primary-color-text);
}
</style>