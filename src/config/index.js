import moment from "moment";

export function setup() {
    moment.relativeTimeThreshold('s', 59);
    moment.relativeTimeThreshold('m', 59);
    moment.relativeTimeThreshold('h', 23);
    moment.relativeTimeThreshold('d', 28);
}

export default {
    setup,
}