<script setup>
import {ref} from "vue";
import {usePrimeVue} from "primevue/config";
import clevvaLogo from "@/assets/clevva.png";
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/auth.store.js";
import browserStorage from "@/lib/browser-storage.js";

const PrimeVue = usePrimeVue();

const isDarkMode = ref(browserStorage.get('themeMode') == 'dark');
const isChangingTheme = ref(false);

const {userFullName, userInitials, isAuthenticated} = storeToRefs(useAuthStore());
const {logoutUser} = useAuthStore();

const menuItems = ref([
	{label: 'Home', 'icon': 'pi pi-home', route: '/', requiresAuth: true},
]);

const accountMenu = ref();
const accountMenuItems = ref([
	{separator: true},
	{label: `Logout`, icon: 'pi pi-sign-out', command: logoutUser}
]);
const handleThemeChange = async () => {
	if (isChangingTheme.value) return;

	const themeLink = document.getElementById('theme-link');

	if (themeLink) {
		const regexResult = /.+-(light|dark)-.+\/theme\.css/i.exec(themeLink.getAttribute('href'));

		if (!!regexResult && !!regexResult[1]) {
			const currentThemeMode = regexResult[1];
			const newThemeMode = currentThemeMode == 'dark' ? 'light' : 'dark';

			await new Promise(resolve => {
				isChangingTheme.value = true;

				PrimeVue.changeTheme(
					`aura-${currentThemeMode}-green`,
					`aura-${newThemeMode}-green`,
					'theme-link',
					() => {
						document.body.setAttribute('data-theme', newThemeMode);
						browserStorage.set('themeMode', newThemeMode);
						isDarkMode.value = (newThemeMode == 'dark');
						resolve()
					});
			}).finally(() => {
				isChangingTheme.value = false;
			})
		}
	}
};

const toggleAccountMenu = (evt) => {
	accountMenu.value?.toggle(evt)
}

</script>

<template>
	<nav class="app--navbar">
		<Menubar :model="menuItems" style="border-radius:0">
			<template #start>
				<div class="p-1 flex align-items-center app-logo-container" style="width: fit-content; margin-right:auto; border-radius: 8px">
					<img :src="clevvaLogo" alt="Clevva" height="20"/>
				</div>
			</template>
			<template #item="{ item, props, hasSubmenu }">
				<template v-if="!item.requiresAuth || (isAuthenticated && item.requiresAuth)">
					<RouterLink v-if="item.route" v-slot="{ href }" :to="item.route" custom>
						<a :href="href" v-bind="props.action">
							<span :class="['p-menuitem-icon', item.icon]"></span>
							<span class="p-menuitem-text">{{ item.label }}</span>
						</a>
					</RouterLink>
					<a v-else :href="item.url" :target="item.target" v-bind="props.action">
						<span :class="['p-menuitem-icon', item.icon]"></span>
						<span class="p-menuitem-text">{{ item.label }}</span>
					</a>
				</template>
			</template>
			<template #end>
				<div class="flex align-items-center" style="padding-right: 0.5rem">
					<Button
						:icon="`pi pi-${isDarkMode ? 'sun' : 'moon'}`"
						size="small"
						style="width:22px; height: 22px; padding: 8px"
						class="flex align-items-center justify-content-center mr-2"
						:class="{
							'bg-white': isDarkMode,
							'border-white': isDarkMode,
							'text-black-alpha-90': isDarkMode,
							'bg-black-alpha-90': !isDarkMode,
							'border-black-alpha-90': !isDarkMode,
							'text-white-alpha-90': !isDarkMode
						}"
						@click="handleThemeChange()"
						:disabled="isChangingTheme"
						rounded
					/>
					<Avatar
						v-if="isAuthenticated"
						size="small"
						class="flex align-items-center justify-content-center text-white"
						style="width:30px; height: 30px;font-size: 12px; cursor: pointer;user-select:none; background-color:#009fff; font-weight: bolder;"
						:label="userInitials"
						shape="circle"
						aria-haspopup="true"
						aria-controls="navbarAccountMenu"
						@click="toggleAccountMenu"
						rounded
					/>
					<Menu v-if="isAuthenticated" ref="accountMenu" id="navbarAccountMenu" :model="accountMenuItems" :popup="true">
						<template #start>
							<div class="flex align-items-center px-2 pt-2 pb-1">
								<Avatar
									v-if="isAuthenticated"
									size="small"
									class="flex align-items-center justify-content-center text-white"
									style="width:30px; height: 30px;font-size: 12px; cursor: pointer;user-select:none; background-color:#009fff; font-weight: bolder;"
									:label="userInitials"
									shape="circle"
									aria-haspopup="true"
									aria-controls="navbarAccountMenu"
									@click="toggleAccountMenu"
									rounded
									/>
								<div class="ml-2">{{ userFullName }}</div>
							</div>
						</template>
					</Menu>
				</div>
			</template>
		</Menubar>
		<div class="app-logo-container-mobile p-1 align-items-center app-logo-container position-absolute-center" style="width: fit-content; border-radius: 8px">
			<img :src="clevvaLogo" alt="Clevva" height="20"/>
		</div>
	</nav>
	<div class="app--main-container">
		<RouterView :key="$route.path" v-slot="{ Component, route }">
			<template v-if="!!Component">
				<Transition mode="out-in">
					<Suspense>
						<component :is="Component"></component>
						<template #fallback>
							<div class="relative" style="height: 100%">
								<ProgressSpinner class="position-fixed-center" strokeWidth="4"/>
							</div>
						</template>
					</Suspense>
				</Transition>
			</template>

		</RouterView>
	</div>
</template>

<style>
.app--navbar {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	z-index: 1000000000;
}

.app--navbar > .p-menubar.p-component {
	-webkit-backdrop-filter: blur(8px);
	backdrop-filter: blur(8px);
}

body[data-theme="light"] .app--navbar > .p-menubar.p-component {
	background-color: rgba(255, 255, 255, 0.7);
}

body[data-theme="dark"] .app--navbar > .p-menubar.p-component {
	background-color: rgba(0, 0, 0, 0.3);
	border-bottom: 1px solid #27272a;
}

.app--navbar > .p-menubar.p-component .p-menubar-start {
	display: none;
	margin-right: auto;
}

.app--navbar > .p-menubar.p-component .p-menubar-end {
	margin-left: auto;
}

.app--main-container {
	height: 100%;
	min-height: 100%;
	margin-top: 54px;
}

.app--navbar .app-logo-container-mobile {
	display: flex;
}

#navbarAccountMenu {
	top: 60px !important;
	position: fixed !important;
}

@media screen and (min-width: 961px) {
	.app--navbar > .p-menubar.p-component .p-menubar-root-list {
		margin: 0 auto;
		padding-right: 28px;
	}

	.app--navbar > .p-menubar.p-component .p-menubar-start {
		padding-right: unset;
		display: flex;
	}

	.app--navbar .app-logo-container-mobile {
		display: none;
	}
}
</style>