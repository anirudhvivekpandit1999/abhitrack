import { useState } from "react";

const CRITICAL_KEYS = ['user', 'token', 'external_user_token', 'session_id'];

const clearNonEssentialStorage = (preserveKey = null) => {
    try {
        const keysToRemove = [];
        const criticalSet = new Set(CRITICAL_KEYS);
        if (preserveKey) {
            criticalSet.add(preserveKey);
        }
        
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key && !criticalSet.has(key) && !key.startsWith('_idxdb_')) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            try {
                window.localStorage.removeItem(key);
            } catch (e) {
            }
        });
        
        return keysToRemove.length;
    } catch (e) {
        return 0;
    }
};

export const useLocalStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.localStorage.getItem(keyName);
            return value ? JSON.parse(value) : defaultValue;
        } catch (err) {
            return defaultValue;
        }
    });

    const setValue = (newValue) => {
        const valueString = JSON.stringify(newValue);
        const valueSize = new Blob([valueString]).size;
        
        try {
            window.localStorage.setItem(keyName, valueString);
        } catch (err) {
            if (err.name === 'QuotaExceededError' || err.code === 22) {
                if (CRITICAL_KEYS.includes(keyName)) {
                    const criticalSet = new Set(CRITICAL_KEYS);
                    criticalSet.add(keyName);
                    
                    const itemsToRemove = [];
                    for (let i = 0; i < window.localStorage.length; i++) {
                        const key = window.localStorage.key(i);
                        if (key && !criticalSet.has(key) && !key.startsWith('_idxdb_')) {
                            try {
                                const itemValue = window.localStorage.getItem(key);
                                const itemSize = new Blob([itemValue || '']).size;
                                itemsToRemove.push({ key, size: itemSize });
                            } catch (e) {
                                itemsToRemove.push({ key, size: 0 });
                            }
                        }
                    }
                    
                    itemsToRemove.sort((a, b) => b.size - a.size);
                    
                    for (const item of itemsToRemove) {
                        try {
                            window.localStorage.removeItem(item.key);
                        } catch (e) {
                        }
                        try {
                            window.localStorage.setItem(keyName, valueString);
                            setStoredValue(newValue);
                            return;
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    for (let i = window.localStorage.length - 1; i >= 0; i--) {
                        const key = window.localStorage.key(i);
                        if (key && key !== keyName && !criticalSet.has(key)) {
                            try {
                                window.localStorage.removeItem(key);
                            } catch (e) {
                            }
                        }
                    }
                    
                    try {
                        window.localStorage.setItem(keyName, valueString);
                    } catch (lastError) {
                    }
                } else {
                    const LARGE_DATA_KEYS = ['withoutProductData', 'withProductData', 'fileInfo', 'availableColumns', 'pendingColumns', 'updatedColumns'];
                    const itemsToRemove = [];
                    
                    for (const oldKey of LARGE_DATA_KEYS) {
                        if (oldKey !== keyName) {
                            try {
                                const itemValue = window.localStorage.getItem(oldKey);
                                const itemSize = new Blob([itemValue || '']).size;
                                itemsToRemove.push({ key: oldKey, size: itemSize });
                            } catch (e) {
                                itemsToRemove.push({ key: oldKey, size: 0 });
                            }
                        }
                    }
                    
                    itemsToRemove.sort((a, b) => b.size - a.size);
                    
                    for (const item of itemsToRemove) {
                        try {
                            window.localStorage.removeItem(item.key);
                        } catch (e) {
                        }
                    }
                    
                    try {
                        window.localStorage.setItem(keyName, valueString);
                    } catch (retryError) {
                        const cleared = clearNonEssentialStorage(keyName);
                        try {
                            window.localStorage.setItem(keyName, valueString);
                        } catch (finalError) {
                        }
                    }
                }
            }
        }
        setStoredValue(newValue);
    };

    const clearLocalStorage = () => {
        window.localStorage.removeItem(keyName);
    };

    return [storedValue, setValue, clearLocalStorage];
};
