import {createApp} from "vue";
import PrimeVue from "primevue/config";
import router from "./router/index.js";
import "primeicons/primeicons.css";
import "./style.css";
import "primeflex/primeflex.css"
import App from "./App.vue";
import {createPinia} from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import config from "@/config/index.js";

const app = createApp(App);
config.setup();

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(PrimeVue);
app.use(router);

app.mount('#app');