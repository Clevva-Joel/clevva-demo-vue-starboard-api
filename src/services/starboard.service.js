import httpClient from "@/lib/http-client.js";
import {
    API_URL_STARBOARD_LOGIN,
    API_URL_STARBOARD_SATE,
    API_URL_STARBOARD_STATE_ACTION,
    API_URL_STARBOARD_VA_START,
    API_URL_VA_LIST
} from "@/config/urls.js";

export async function login(credentials) {
    const response = await httpClient.post(API_URL_STARBOARD_LOGIN, credentials);

    return response.data.data
}

export async function fetchVAs(params = {}) {
    params = Object(params);
    const response = await httpClient.get(API_URL_VA_LIST, {params});

    return response.data.data;
}

export async function fetchVA(code) {
    const [va] = await fetchVAs({filter: {code}});

    return va || Promise.reject(({error: {message: 'Not Found'}}));
}

export async function startVA(code) {
    const {data: {data: {stateid}}} = await httpClient.post(API_URL_STARBOARD_VA_START, {va: {code}});

    return await fetchState(stateid);
}

export async function fetchState(stateId) {
    const {data: {data: {cards}}} = await httpClient.get(`${API_URL_STARBOARD_SATE}/${stateId}/all`);

    return {
        currentStateId: stateId,
        states: cards
    };
}

export async function triggerAction(actionData) {
    const {data: {data: {stateid}}} = await httpClient.post(API_URL_STARBOARD_STATE_ACTION, actionData);

    return await fetchState(stateid);
}