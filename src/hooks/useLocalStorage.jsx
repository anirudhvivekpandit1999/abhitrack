import { useState } from "react";

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
        try {
            window.localStorage.setItem(keyName, JSON.stringify(newValue));
        } catch (err) {
            if (err.name === 'QuotaExceededError' || err.code === 22) {
                console.warn(`LocalStorage quota exceeded for ${keyName}. Attempting to free space...`);
                
                const keysToClear = ['withoutProductData', 'withProductData'];
                keysToClear.forEach(oldKey => {
                    if (oldKey !== keyName) {
                        try {
                            window.localStorage.removeItem(oldKey);
                        } catch (e) {
                        }
                    }
                });
                
                try {
                    window.localStorage.setItem(keyName, JSON.stringify(newValue));
                    console.log(`Successfully saved ${keyName} after clearing old data`);
                } catch (retryError) {
                    console.error(`Failed to save ${keyName} even after clearing space. Data may be too large.`, retryError);
                }
            } else {
                console.error(`Error saving to localStorage for ${keyName}:`, err);
            }
        }
        setStoredValue(newValue);
    };

    const clearLocalStorage = () => {
        window.localStorage.removeItem(keyName);
    };

    return [storedValue, setValue, clearLocalStorage];
};