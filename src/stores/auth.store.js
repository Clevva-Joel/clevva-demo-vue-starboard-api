import {defineStore} from "pinia";
import lodash from "lodash";
import {login} from "@/services/starboard.service.js";
import browserStorage from "@/lib/browser-storage.js";
import router from "@/router/index.js";
import {useStarboardStore} from "@/stores/starboard.store.js";

const defaultState = {
    user: null,
    jwt: null,
    isAuthenticating: false,
    loginError: null
}

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({...defaultState}),
    persist: true,
    getters: {
        isAuthenticated: state => {
            return !lodash.some(state.user, v => !v?.trim()) && !!state.jwt?.trim()
        },
        userFullName: state => {
            return `${state.user?.firstname} ${state.user?.lastname}`
        },
        userInitials: state => {
            const fullNameArray = `${state.user?.firstname} ${state.user?.lastname}`.split(' ');

            return `${fullNameArray[0].at(0)} ${fullNameArray[fullNameArray.length - 1].at(0)}`;
        }
    },
    actions: {
        async loginUser(credentials) {
            if (this.isAuthenticating) return;

            try {
                this.loginError = null;
                this.isAuthenticating = true;
                const data = await login(credentials);
                this.user = {
                    firstname: data.firstname, 
                    lastname: data.lastname, 
                    email: data.email
                };
                this.jwt = data.jwt;

                const currentRoute = router.currentRoute.value;
                const continueToPath = currentRoute && currentRoute.query.continue && !/^\/?(login|logout)/.test(currentRoute.query.continue)
                    ? currentRoute.query.continue
                    : '/';

                await router.replace({path: continueToPath || '/'});
            } catch (error) {
                this.loginError = error.response?.data?.error?.message || 'Login failed. Please try again later.';
            } finally {
                this.isAuthenticating = false;
            }
        },
        async logoutUser() {
            Object.assign(this, defaultState);
            useStarboardStore().reset?.();

            browserStorage.clearAllExcept(['themeMode']);

            await router.replace('/login')
                .then(() => {
                    window.location.reload();
                });
        }
    }
});