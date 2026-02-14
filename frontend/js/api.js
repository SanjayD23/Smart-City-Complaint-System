// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Helper function to get user data
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Helper function to save auth data
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Helper function to clear auth data
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// API request wrapper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        ...options.headers
    };

    // Add authorization header if token exists
    if (token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true
    }),

    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true
    })
};

// Complaints API
const complaintsAPI = {
    create: (formData) => apiRequest('/complaints', {
        method: 'POST',
        body: formData
    }),

    getAll: () => apiRequest('/complaints'),

    getById: (id) => apiRequest(`/complaints/${id}`),

    assign: (id, data) => apiRequest(`/complaints/${id}/assign`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    updateStatus: (id, data) => apiRequest(`/complaints/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// Departments API
const departmentsAPI = {
    getAll: () => apiRequest('/departments'),

    create: (data) => apiRequest('/departments', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getOfficers: (departmentId) => apiRequest(`/departments/${departmentId}/officers`)
};

// Utility functions
function showAlert(message, type = 'success') {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    container.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;

    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

// Check authentication
function checkAuth() {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        window.location.href = 'login.html';
        return null;
    }

    return user;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        'pending': 'badge-pending',
        'assigned': 'badge-assigned',
        'in_progress': 'badge-in-progress',
        'resolved': 'badge-resolved',
        'rejected': 'badge-rejected'
    };

    const statusText = status.replace('_', ' ').toUpperCase();
    return `<span class="badge ${statusMap[status] || 'badge-pending'}">${statusText}</span>`;
}
