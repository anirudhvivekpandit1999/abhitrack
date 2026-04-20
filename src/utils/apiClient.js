const API_BASE_URL = 'http://91.203.132.34:8001/api';

const getSessionId = () => {
    try {
        return localStorage.getItem('session_id') || null;
    } catch (e) {
        return null;
    }
};

const getAuthToken = () => {
    try {
        return localStorage.getItem('token') || null;
    } catch (e) {
        return null;
    }
};

const getHeaders = (includeAuth = false, contentType = 'application/json') => {
    const headers = {
        'Content-Type': contentType,
    };
    
    const sessionId = getSessionId();
    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }
    
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        if (response.status === 401) {
            if (errorData.code === 'SESSION_NOT_FOUND') {
                throw new Error('Session expired. Please upload files again.');
            }
            throw new Error(errorData.error || 'Authentication failed. Please login again.');
        }
        
        if (response.status === 400) {
            const errorMsg = errorData.errors 
                ? (Array.isArray(errorData.errors) ? errorData.errors.join(', ') : errorData.errors)
                : (errorData.error || 'Bad request');
            throw new Error(errorMsg);
        }
        
        if (response.status === 422) {
            const errorMsg = errorData.detail 
                ? (Array.isArray(errorData.detail) ? errorData.detail.join(', ') : errorData.detail)
                : (errorData.error || 'Validation error');
            throw new Error(errorMsg);
        }
        
        throw new Error(errorData.error || errorData.detail || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
};

export const apiClient = {
    get: async (endpoint, options = {}) => {
        const { includeAuth = false, ...fetchOptions } = options;
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(includeAuth),
            credentials: 'include',
            ...fetchOptions
        });
        
        return handleResponse(response);
    },
    
    post: async (endpoint, data = null, options = {}) => {
        const { includeAuth = false, ...fetchOptions } = options;
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        // 🔥 AUTO-DETECT FormData
        const isFormData = data instanceof FormData;

        let headers = {};

        if (!isFormData) {
            // ✅ Normal JSON request
            headers = getHeaders(includeAuth, 'application/json');
        } else {
            // ✅ FormData request (DO NOT set Content-Type)
            const sessionId = getSessionId();
            if (sessionId) {
                headers['X-Session-ID'] = sessionId;
            }

            if (includeAuth) {
                const token = getAuthToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }
        }
        
        const body = isFormData ? data : (data ? JSON.stringify(data) : null);
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            credentials: 'include',
            body,
            ...fetchOptions
        });
        
        return handleResponse(response);
    },
    
    put: async (endpoint, data = null, options = {}) => {
        const { includeAuth = false, ...fetchOptions } = options;
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(includeAuth),
            credentials: 'include',
            body: data ? JSON.stringify(data) : null,
            ...fetchOptions
        });
        
        return handleResponse(response);
    },
    
    delete: async (endpoint, options = {}) => {
        const { includeAuth = false, ...fetchOptions } = options;
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(includeAuth),
            credentials: 'include',
            ...fetchOptions
        });
        
        return handleResponse(response);
    }
};

export default apiClient;
