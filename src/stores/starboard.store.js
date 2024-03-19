import {defineStore} from "pinia";
import lodash from "lodash";
import moment from "moment";
import * as starboardService from "@/services/starboard.service.js"

const defaultState = {
    VAs: [],
    isLoadingVAs: false,
    loadVAsError: null,
    searchFilter: null,
    sessionData: {}
}

export const useStarboardStore = defineStore({
    id: 'starboard',
    state: () => ({...defaultState}),
    persist: {
        paths: ['VAs', 'sessionData']
    },
    getters: {
        filteredVAs: (state) => {
            return !state.searchFilter?.trim()
                ? state.VAs
                : state.VAs.filter(va => {
                    const filterValue = state.searchFilter.toLowerCase();

                    return va.name.toLowerCase().includes(filterValue) || va.code.toLowerCase().includes(filterValue);
                });
        },
        recentSessions: (state) => {
            let data = {};
            for (const [sessionCode, sessionDetails] of Object.entries(state.sessionData)) {
                if (!data[sessionDetails.vaCode]) {
                    data[sessionDetails.vaCode] = [];
                }
                let state = sessionDetails.states[sessionDetails.states.length - 1];
                state.extra = {vaCode: sessionDetails.vaCode, sessionCode, ranToEnd: sessionDetails.ranToEnd };

                data[sessionDetails.vaCode].push(state);
            }

            for (const [vaCode] of Object.entries(data)) {
                data[vaCode].sort((s1, s2) => {
                    const time1 = moment(s1.datetime, 'YYYY-MM-DD HH:mm:ss').format('x');
                    const time2 = moment(s2.datetime, 'YYYY-MM-DD HH:mm:ss').format('x');

                    if (time1 < time2) return 1;
                    else if (time1 > time2) return -1;
                    else return 0;
                });
            }

            return data;
        }
    },
    actions: {
        async loadVAs() {
            if (this.isLoadingVAs) return;

            try {
                this.loadVAsError = null;
                this.isLoadingVAs = true;
                this.VAs = await starboardService.fetchVAs();
            } catch (error) {
                console.log(error);
                this.loadVAsError = error.response?.data?.error?.message || 'An error occurred.';
                this.VAs = [];
            } finally {
                this.isLoadingVAs = false;
            }
        },
        setSession(vaCode, sessionCode, states) {
            if (!lodash.isObject(this.sessionData[sessionCode])) {
                this.sessionData[sessionCode] = {
                    vaCode,
                    sessionCode,
                    states: [],
                    ranToEnd: false,
                    datetime_started: moment().local().format('YYYY-MM-DD HH:mm:ss'),
                };
            }

            this.sessionData[sessionCode].states = states;
            this.sessionData[sessionCode].ranToEnd = states[states.length - 1].load_data.type == 'summary';
        },
        removeSession(sessionCode) {
            if (!!this.sessionData[sessionCode]) {
                let filterSessions = {};

                for (const [key, value] of Object.entries(this.sessionData)) {
                    if (key == sessionCode) continue;
                    filterSessions[key] = value;
                }
                this.sessionData = filterSessions;
            }
        },
        reset() {
            Object.assign(this, defaultState);
        }
    }
});