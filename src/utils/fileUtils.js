import { saveToSmartStorage, getFromSmartStorage, removeFromSmartStorage, saveToIndexedDB } from './indexedDBUtils';

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const saveToSessionStorage = async (key, data) => {
    if (!data) return;
    
    try {
        await saveToSmartStorage(key, data, 3 * 1024 * 1024);
    } catch (error) {
        try {
            const errorMarker = { 
                _error: 'Data too large for storage',
                _size: data?.length || 0,
                _timestamp: new Date().toISOString(),
                _message: error.message
            };
            try {
                sessionStorage.setItem(key, JSON.stringify(errorMarker));
            } catch (e) {
                try {
                    await saveToIndexedDB(key, errorMarker);
                } catch (e2) {
                }
            }
        } catch (finalError) {
        }
    }
};

export const getFromSessionStorage = (key, defaultValue = null, sync = true) => {
    if (sync) {
        try {
            const cachedData = sessionStorage.getItem(key);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        } catch (error) {
        }
        return defaultValue;
    } else {
        return getFromSmartStorage(key, defaultValue).catch(error => {
            return defaultValue;
        });
    }
};

export const removeFromSessionStorage = async (key) => {
    try {
        await removeFromSmartStorage(key);
    } catch (error) {
    }
};
