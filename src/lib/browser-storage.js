import lodash from "lodash";

export default {
    storageDriver() {
        return localStorage;
    },
    set(key, value) {
        this.storageDriver().setItem(key, value);
    },
    get(key, defaultValue = null, asJson = false) {
        let value = this.storageDriver().getItem(key);

        if (asJson) {
            try {
                value = JSON.parse(value);
            } catch (e) {}
        }

        return value !== null ? value : defaultValue;
    },
    has(key) {
        return this.storageDriver().getItem(key) !== null;
    },
    remove(key) {
        return this.storageDriver().removeItem(key);
    },
    clearAll() {
        this.storageDriver().clear();
    },
    clearAllExcept(exceptKeys) {
        exceptKeys = lodash.isString(exceptKeys) ? [exceptKeys] : (Array.isArray(exceptKeys) ? exceptKeys : []);

        for (let i = 0; i < this.storageDriver().length; i++) {
            const k = this.storageDriver().key(i);
            if (!exceptKeys.includes(k)) {
                this.remove(k);
            }
        }
    }
}