import axios from "axios";
import {useAuthStore} from "@/stores/auth.store.js";
import lodash from "lodash";
import router from "@/router/index.js";

const httpClient = axios.create();

httpClient.interceptors.request.use(config => {
    const {isAuthenticated, jwt} = useAuthStore();

    if (isAuthenticated) {
        config.headers['Authorization'] = `Bearer ${jwt}`;
    }

    return config;
});

httpClient.interceptors.response.use(
    response => {
        return response.data.error ? Promise.reject({response}) : response;
    },
    async (error) => {
        error.response = error.response || {status: 500};

        if (!error.response.data || lodash.isString(error.response.data)) {
            error.response.data = {
                error: {
                    message: lodash.isString(error.response.data) ? error.response.data : 'An error occurred'
                }
            }
        }

        const {isAuthenticated, jwt, logoutUser} = useAuthStore();

        if ((error.response.status == 401 || error.response.status == 412) && isAuthenticated) {
            logoutUser();
        }

        return error;
    }
);
export default httpClient;