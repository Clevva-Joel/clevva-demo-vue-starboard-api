<script setup>
import clevvaLogo from "@/assets/clevva.png";
import {useAuthStore} from "@/stores/auth.store.js";
import {reactive, ref} from "vue";
import {storeToRefs} from "pinia";

const email = ref('');
const password = ref('');
const validationErrors = reactive({email: '', password: ''})

const {isAuthenticating, loginError} = storeToRefs(useAuthStore());
const {loginUser} = useAuthStore();
const handleLogin = () => {
	if (isAuthenticating.value) return;

	validationErrors.email = !email.value ? 'Email is required' : '';
	validationErrors.password = !password.value || !password.value.trim().length ? 'Password is required' : '';

	if (validationErrors.email && validationErrors.password) return;

	loginUser({
		email: email.value.trim(),
		password: password.value
	});
}
</script>

<template>
	<div class="grid pt-8 px-5">
		<div class="col-12">
			<Card class="login-from mx-auto">
				<template #content>
					<form class="mb-4" @submit.prevent="handleLogin">
						<div class="mt-4 mb-6">
							<div class="mx-auto app-logo-container flex align-items-center" style="width: fit-content; border-radius: 8px">
								<img :src="clevvaLogo" alt="Clevva" height="36px" class="block"/>
							</div>
						</div>
						<div v-if="!!loginError" class="mb-4 text-center text-red-500">{{ loginError }}</div>
						<div class="form-group">
							<label for="email" class="block">Email</label>
							<InputText v-model.trim="email" id="email" class="w-full" :disabled="isAuthenticating"></InputText>
							<div class="mt-1 text-red-500" v-if="!!validationErrors.email">{{ validationErrors.email }}</div>
						</div>
						<div class="form-group">
							<label for="password" class="block">Password</label>
							<InputText v-model="password" id="password" class="w-full" type="password" :disabled="isAuthenticating"></InputText>
							<div class="mt-1 text-red-500" v-if="!!validationErrors.password">{{ validationErrors.password }}</div>
						</div>
						<Button type="submit" class="block w-full mt-5" :disabled="isAuthenticating">Login</Button>
					</form>
				</template>
			</Card>
		</div>
	</div>

</template>

<style scoped>
.form-group {
	margin-bottom: 15px;
}
.form-group > label {
	margin-bottom: 8px
}
@media screen and (min-width: 768px) {
	.login-from {
		max-width: 420px;
	}
}
</style>