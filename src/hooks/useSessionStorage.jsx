import { useState, useEffect } from "react";
import { saveToSmartStorage, getFromSmartStorage, removeFromSmartStorage, isInIndexedDB } from '../utils/indexedDBUtils';

export const useSessionStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.sessionStorage.getItem(keyName);
            if (value) {
                return JSON.parse(value);
            }
            if (isInIndexedDB(keyName)) {
                return defaultValue;
            }
            return defaultValue;
        } catch (err) {
            return defaultValue;
        }
    });

    useEffect(() => {
        const loadFromIndexedDB = async () => {
            if (isInIndexedDB(keyName)) {
                try {
                    const data = await getFromSmartStorage(keyName, defaultValue);
                    if (data !== null && JSON.stringify(data) !== JSON.stringify(storedValue)) {
                        setStoredValue(data);
                    }
                } catch (error) {
                }
            }
        };

        loadFromIndexedDB();
    }, [keyName, defaultValue, storedValue]);

    const setValue = (newValue) => {
        setStoredValue(newValue);
        
        (async () => {
            try {
                try {
                    window.sessionStorage.setItem(keyName, JSON.stringify(newValue));
                } catch (err) {
                    try {
                        window.sessionStorage.removeItem(`_idxdb_${keyName}`);
                    } catch (e) {
                    }
                    if (err.name === 'QuotaExceededError' || err.code === 22) {
                        try {
                            await saveToSmartStorage(keyName, newValue, 3);
                        } catch (indexedDBError) {
                        }
                    } else {
                        const dataSize = new Blob([JSON.stringify(newValue)]).size;
                        if (dataSize > 3 * 1024 * 1024) {
                            try {
                                await saveToSmartStorage(keyName, newValue, 3);
                            } catch (indexedDBError) {
                            }
                        } else {
                            throw err;
                        }
                    }
                }
            } catch (error) {
            }
        })();
    };

    const clearSessionStorage = () => {
        setStoredValue(defaultValue);
        
        (async () => {
            try {
                window.sessionStorage.removeItem(keyName);
                window.sessionStorage.removeItem(`_idxdb_${keyName}`);
                
                await removeFromSmartStorage(keyName);
            } catch (error) {
            }
        })();
    };

    return [storedValue, setValue, clearSessionStorage];
};
