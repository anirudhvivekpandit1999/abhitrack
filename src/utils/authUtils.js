export const AUTH_STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  EXTERNAL_TOKEN: 'external_user_token',
  SESSION_ID: 'session_id'
};

export const USER_TYPES = {
  ADMIN: 'Admin',
  EXTERNAL: 'External'
};

export const storeAuthData = (userData, accessToken, userType = USER_TYPES.EXTERNAL) => {
  try {
    const userToStore = {
      ...userData,
      access: userType
    };

    const saveWithFallback = (key, value) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const valueSize = new Blob([stringValue]).size;
      
      try {
        localStorage.setItem(key, stringValue);
      } catch (error) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          const criticalKeys = [
            AUTH_STORAGE_KEYS.USER, 
            AUTH_STORAGE_KEYS.TOKEN, 
            AUTH_STORAGE_KEYS.EXTERNAL_TOKEN,
            AUTH_STORAGE_KEYS.SESSION_ID,
            'session_id'
          ];
          
          const criticalSet = new Set(criticalKeys);
          criticalSet.add(key);
          
          const itemsToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey && !criticalSet.has(storageKey) && !storageKey.startsWith('_idxdb_')) {
              try {
                const itemValue = localStorage.getItem(storageKey);
                const itemSize = new Blob([itemValue || '']).size;
                itemsToRemove.push({ key: storageKey, size: itemSize });
              } catch (e) {
                itemsToRemove.push({ key: storageKey, size: 0 });
              }
            }
          }
          
          itemsToRemove.sort((a, b) => b.size - a.size);
          
          for (const item of itemsToRemove) {
            try {
              localStorage.removeItem(item.key);
            } catch (e) {
            }
            try {
              localStorage.setItem(key, stringValue);
              return;
            } catch (e) {
              continue;
            }
          }
          
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey !== key && !criticalSet.has(storageKey)) {
              try {
                localStorage.removeItem(storageKey);
              } catch (e) {
              }
            }
          }
          
          try {
            localStorage.setItem(key, stringValue);
          } catch (finalError) {
            throw finalError;
          }
        } else {
          throw error;
        }
      }
    };

    saveWithFallback(AUTH_STORAGE_KEYS.USER, userToStore);
    saveWithFallback(AUTH_STORAGE_KEYS.TOKEN, accessToken);
    
    if (userType === USER_TYPES.EXTERNAL) {
      saveWithFallback(AUTH_STORAGE_KEYS.EXTERNAL_TOKEN, accessToken);
    }
    
    window.dispatchEvent(new Event('auth-storage-change'));

    return true;
  } catch (error) {
    return false;
  }
};

export const getAuthData = () => {
  try {
    const user = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    
    if (user && token) {
      return {
        user: JSON.parse(user),
        token
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = () => {
  const authData = getAuthData();
  return !!(authData?.user && authData?.token);
};

export const clearAuthData = () => {
  try {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

export const getUserType = () => {
  const authData = getAuthData();
  return authData?.user?.access || null;
};

export const hasAccess = (requiredAccess) => {
  const userType = getUserType();
  if (!userType) return false;

  if (Array.isArray(requiredAccess)) {
    return requiredAccess.includes(userType);
  }
  
  return userType === requiredAccess;
};

export const validateAuthData = () => {
  const authData = getAuthData();
  
  if (!authData) {
    clearAuthData();
    return false;
  }

  if (!authData.user?.email || !authData.token) {
    clearAuthData();
    return false;
  }

  return true;
};
