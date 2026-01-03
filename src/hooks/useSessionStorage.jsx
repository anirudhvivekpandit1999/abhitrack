import { useState } from "react";

export const useSessionStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.sessionStorage.getItem(keyName);
            return value ? JSON.parse(value) : defaultValue;
        } catch (err) {
            return defaultValue;
        }
    });

    const setValue = (newValue) => {
        try {
            window.sessionStorage.setItem(keyName, JSON.stringify(newValue));
        } catch (err) {
            if (err.name === 'QuotaExceededError' || err.code === 22) {
                console.warn(`SessionStorage quota exceeded for ${keyName}. Attempting to free space...`);
                
                const keysToClear = ['withoutProductData', 'withProductData', 'availableColumns'];
                keysToClear.forEach(oldKey => {
                    if (oldKey !== keyName) {
                        try {
                            window.sessionStorage.removeItem(oldKey);
                        } catch (e) {
                        }
                    }
                });
                
                try {
                    window.sessionStorage.setItem(keyName, JSON.stringify(newValue));
                    console.log(`Successfully saved ${keyName} after clearing old data`);
                } catch (retryError) {
                    console.error(`Failed to save ${keyName} even after clearing space. Data may be too large.`, retryError);
                    return;
                }
            } else {
                console.error(`Error saving to sessionStorage for ${keyName}:`, err);
                return;
            }
        }
        setStoredValue(newValue);
    };

    const clearSessionStorage = () => {
        window.sessionStorage.removeItem(keyName);
    };

    return [storedValue, setValue, clearSessionStorage];
};

