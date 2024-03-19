import {createRouter, createWebHistory} from "vue-router";
import Home from "@/views/Home.vue";
import VADetails from "@/views/VADetails.vue";
import Login from "@/views/Login.vue";
import NotFound from "@/views/error/NotFound.vue";
import Error from "@/views/error/Error.vue";
import {useAuthStore} from "@/stores/auth.store.js";
import * as starboardService from "@/services/starboard.service.js"
import VARun from "@/views/VARun.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: { title: 'Home', requiresAuth: true }
        },
        {
            path: '/va/:code',
            name: 'va-details',
            component: VADetails,
            props: true,
            meta: { title: 'VA', requiresAuth: true }
        },
        {
            path: '/va/:code/run/:sessionCode',
            name: 'va-run',
            component: VARun,
            props: true,
            meta: { title: 'VA', requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            props: true,
            meta: { title: 'Login', requiresAuth: false }
        },
        {
            path: '/error',
            name: 'error',
            component: Error,
            meta: {title: 'Error'}
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: NotFound,
            meta: {title: 'Not Found'}
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    const {isAuthenticated, logoutUser} = useAuthStore();

    if (to.meta?.requiresAuth && !isAuthenticated && to.path !== '/login') {
        const query = to.path === '/logout' ? {} : {continue: to.path};
        next({
            path: '/login',
            query
        });
    } else {
        if  (/^\/va\/:code\/?/.test(to.matched[0].path)) {
            try {
                to.params.va = await starboardService.fetchVA(to.params.code);
                next();
            } catch (error) {
                console.log(error)
                if (/not[\s|\-]+found/i.test(error.message)) {
                    next({path: '/not-found', replace: true});
                } else {
                    next({path: '/error', replace: true});
                }
            }
        } else {
            next();
        }
    }
});

router.beforeResolve((to, from, next) => {
    let pageTitle = import.meta.env.VITE_APP_APP_NAME?.trim() || 'App';

    if (!!to.meta?.title?.trim()) {
        pageTitle = `${pageTitle} | ${to.meta.title.trim()}`;
    }

    document.title = pageTitle;

    next();
});

export default router;