//import { MMKV } from 'react-native-mmkv';

let storageInstance: any = null;
let nativeMMKVFailed = false;

const memoryBackup = new Map<string, string>();

const getStorage = () => {
  if (nativeMMKVFailed) return null;
  if (storageInstance) {
    return storageInstance;
  }

  try {
    const { MMKV } = require('react-native-mmkv');
    storageInstance = new MMKV({
        id: 'fitweather-storage'
    });
    return storageInstance;
  } catch (error) {
    console.log("MMKV native binding failed to load. Falling back to memory storage safely.");
    nativeMMKVFailed = true;
    return null;
  }
};

export const appStorage = {
  set: (key: string, value: any) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const storage = getStorage();

    if (storage) {
        try {
            storage.set(key, stringValue);
            return ;
        } catch (e) {
            console.log("Failed to write to native MMKV, using memmory.");
        }
    }
    memoryBackup.set(key, stringValue);
  },

  get: (key: string) => {
    let value: string | null | undefined = null;
    const storage = getStorage();

    if (storage) {
      try {
        value = storage.getString(key);
      } catch (e) {
        console.log("Failed to read from native MMKV, using memory.");
      }
    }

    if (!value) {
      value = memoryBackup.get(key);
    }

    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },

  // Διαγραφή
  delete: (key: string) => {
    const storage = getStorage();
    if (storage) {
      try { storage.delete(key); return; } catch (e) {}
    }
    memoryBackup.delete(key);
  },

  // Καθαρισμός
  clearAll: () => {
    const storage = getStorage();
    if (storage) {
      try { storage.clearAll(); return; } catch (e) {}
    }
    memoryBackup.clear();
  }
};