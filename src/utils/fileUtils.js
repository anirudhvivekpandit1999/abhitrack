export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const saveToSessionStorage = (key, data) => {
    try {
        if (data) {
            const dataString = JSON.stringify(data);
            const dataSize = new Blob([dataString]).size;
            
            if (dataSize > 4 * 1024 * 1024) {
                console.warn(`Data for ${key} is too large (${(dataSize / 1024 / 1024).toFixed(2)}MB). Attempting to clear old data...`);
                
                const keysToClear = ['withoutProductData', 'withProductData'];
                keysToClear.forEach(oldKey => {
                    if (oldKey !== key) {
                        try {
                            sessionStorage.removeItem(oldKey);
                        } catch (e) {
                            // Ignore errors when clearing
                        }
                    }
                });
            }
            
            sessionStorage.setItem(key, dataString);
        }
    } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
            console.warn(`Quota exceeded for ${key}. Attempting to free space...`);
            
            try {
                const keysToClear = ['withoutProductData', 'withProductData'];
                keysToClear.forEach(oldKey => {
                    if (oldKey !== key) {
                        sessionStorage.removeItem(oldKey);
                    }
                });
                
                try {
                    sessionStorage.setItem(key, JSON.stringify(data));
                    console.log(`Successfully saved ${key} after clearing old data`);
                } catch (retryError) {
                    console.error(`Failed to save ${key} even after clearing space. Data may be too large.`, retryError);
                    sessionStorage.setItem(key, JSON.stringify({ 
                        _error: 'Data too large for session storage',
                        _size: data?.length || 0,
                        _timestamp: new Date().toISOString()
                    }));
                }
            } catch (clearError) {
                console.error(`Error clearing storage for ${key}:`, clearError);
            }
        } else {
            console.error(`Error saving ${key} to session storage:`, error);
        }
    }
};

export const getFromSessionStorage = (key, defaultValue = null) => {
    try {
        const cachedData = sessionStorage.getItem(key);
        return cachedData ? JSON.parse(cachedData) : defaultValue;
    } catch (error) {
        console.error(`Error getting ${key} from session storage:`, error);
        return defaultValue;
    }
};