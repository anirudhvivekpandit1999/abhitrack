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

/**
 * Store user authentication data in localStorage
 * @param {Object} userData - User data from API response
 * @param {string} accessToken - JWT access token
 * @param {string} userType - Type of user (Admin/External)
 */
export const storeAuthData = (userData, accessToken, userType = USER_TYPES.EXTERNAL) => {
  try {
    const userToStore = {
      ...userData,
      access: userType
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(userToStore));
    
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, accessToken);
    
    if (userType === USER_TYPES.EXTERNAL) {
      localStorage.setItem(AUTH_STORAGE_KEYS.EXTERNAL_TOKEN, accessToken);
    }

    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

/**
 * Get stored authentication data
 * @returns {Object|null} - User data and token or null if not found
 */
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
    console.error('Error getting auth data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
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
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Get user type from stored data
 * @returns {string|null}
 */
export const getUserType = () => {
  const authData = getAuthData();
  return authData?.user?.access || null;
};

/**
 * Check if user has specific access level
 * @param {string|string[]} requiredAccess - Required access level(s)
 * @returns {boolean}
 */
export const hasAccess = (requiredAccess) => {
  const userType = getUserType();
  if (!userType) return false;

  if (Array.isArray(requiredAccess)) {
    return requiredAccess.includes(userType);
  }
  
  return userType === requiredAccess;
};

/**
 * Validate and refresh auth data if needed
 * @returns {boolean} - True if auth data is valid
 */
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