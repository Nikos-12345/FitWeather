const { MMKV } = require ('react-native-mmkv');

export const storage = new MMKV({
  id: 'fitweather-storage'
});

export const appStorage = {
    set: (key: string, value: any) => {
        if (typeof value === 'object') {
            storage.set(key, JSON.stringify(value));
        } else {
            storage.set(key, value);
        }
    },

    get: (key: string) => {
        const value = storage.getString(key);
        if (!value) return null;

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    },

    delete: (key: string) => {
        storage.delete(key);
    },

    clearAll: () => {
        storage.clearAll();
    }
}