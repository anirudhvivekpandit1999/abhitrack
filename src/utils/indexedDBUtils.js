const DB_NAME = 'AbhiTechStatisticalTool';
const DB_VERSION = 1;
const STORE_NAME = 'largeData';
let dbInstance = null;

const initDB = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

const isIndexedDBAvailable = () => {
    return !!window.indexedDB;
};

const saveToIndexedDB = async (key, data) => {
    if (!isIndexedDBAvailable()) {
        throw new Error('IndexedDB not available');
    }

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const dataString = JSON.stringify(data);
        await new Promise((resolve, reject) => {
            const request = store.put(dataString, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        try {
            sessionStorage.setItem(`_idxdb_${key}`, '1');
        } catch (e) {
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
        sessionStorage.removeItem(`_idxdb_${key}`);
        throw error;
    }
};

const getFromIndexedDB = async (key) => {
    if (!isIndexedDBAvailable()) {
        return null;
    }

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const dataString = await new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (dataString) {
            await new Promise(resolve => setTimeout(resolve, 30));
            return JSON.parse(dataString);
        }
        return null;
    } catch (error) {
        return null;
    }
};

const removeFromIndexedDB = async (key) => {
    if (!isIndexedDBAvailable()) {
        return;
    }

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        try {
            sessionStorage.removeItem(`_idxdb_${key}`);
        } catch (e) {
        }
        await new Promise(resolve => setTimeout(resolve, 30));
    } catch (error) {
    }
};

const isInIndexedDB = (key) => {
    try {
        return sessionStorage.getItem(`_idxdb_${key}`) === '1';
    } catch (e) {
        return false;
    }
};

const clearIndexedDB = async () => {
    if (!isIndexedDBAvailable()) {
        return;
    }

    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('_idxdb_')) {
                    try {
                        sessionStorage.removeItem(key);
                    } catch (e) {
                    }
                }
            });
        } catch (e) {
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
    }
};

const getDataSize = (data) => {
    try {
        return new Blob([JSON.stringify(data)]).size;
    } catch {
        return 0;
    }
};

const saveToSmartStorage = async (key, data, sizeThreshold = 3 * 1024 * 1024) => {
    const dataSize = getDataSize(data);

    if (dataSize > sizeThreshold && isIndexedDBAvailable()) {
        try {
            await saveToIndexedDB(key, data);
            return;
        } catch (error) {
        }
    }

    try {
        sessionStorage.setItem(key, JSON.stringify(data));
        try {
            sessionStorage.removeItem(`_idxdb_${key}`);
        } catch (e) {
        }
        await new Promise(resolve => setTimeout(resolve, 20));
    } catch (error) {
        if ((error.name === 'QuotaExceededError' || error.code === 22) && isIndexedDBAvailable()) {
            try {
                const keysToClear = ['withoutProductData', 'withProductData', 'fileInfo', 'availableColumns'];
                const itemsToRemove = [];
                
                for (const oldKey of keysToClear) {
                    if (oldKey !== key) {
                        try {
                            const itemValue = sessionStorage.getItem(oldKey);
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
                        sessionStorage.removeItem(item.key);
                        try {
                            sessionStorage.removeItem(`_idxdb_${item.key}`);
                        } catch (e) {
                        }
                    } catch (e) {
                    }
                }
                
                try {
                    sessionStorage.setItem(key, JSON.stringify(data));
                    try {
                        sessionStorage.removeItem(`_idxdb_${key}`);
                    } catch (e) {
                    }
                    await new Promise(resolve => setTimeout(resolve, 20));
                    return;
                } catch (retryError) {
                }
                
                await saveToIndexedDB(key, data);
            } catch (indexedDBError) {
                throw error;
            }
        } else {
            throw error;
        }
    }
};

const getFromSmartStorage = async (key, defaultValue = null) => {
    try {
        const cachedData = sessionStorage.getItem(key);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
    } catch (error) {
    }

    if (isInIndexedDB(key) && isIndexedDBAvailable()) {
        try {
            const data = await getFromIndexedDB(key);
            if (data !== null) {
                return data;
            }
        } catch (error) {
        }
    }

    return defaultValue;
};

const removeFromSmartStorage = async (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
    }
    
    try {
        sessionStorage.removeItem(`_idxdb_${key}`);
    } catch (error) {
    }

    if (isIndexedDBAvailable()) {
        try {
            await removeFromIndexedDB(key);
        } catch (error) {
        }
    }

    await new Promise(resolve => setTimeout(resolve, 20));
};

export {
    saveToSmartStorage,
    getFromSmartStorage,
    removeFromSmartStorage,
    isInIndexedDB,
    clearIndexedDB,
    isIndexedDBAvailable,
    getDataSize,
    saveToIndexedDB
};
