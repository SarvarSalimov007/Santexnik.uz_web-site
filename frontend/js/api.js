// api.js - Centralized API calls for Santexnik.uz

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : '';

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    _getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async _fetch(url, options = {}) {
        if (!this.baseUrl) {
            // Mock mode for Vercel Demo
            return this._mockData(url, options);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeout);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }
            if (response.status === 204) return null;
            return await response.json();
        } catch (e) {
            clearTimeout(timeout);
            throw e;
        }
    }

    _mockData(url, options) {
        if (url.includes('/stats')) {
            return Promise.resolve({ total_workers: 0, total_reviews: 0, avg_rating: 0, categories: {} });
        }
        if (url.includes('/workers') && (!options.method || options.method === 'GET')) {
            if (url.match(/\/workers\/\d+\/reviews/)) return Promise.resolve([]);
            // No fake workers - show real data only
            return Promise.resolve([]);
        }
        if (url.includes('/token')) return Promise.resolve({ access_token: 'mock_token' });
        return Promise.resolve({ success: true });
    }

    // === Workers ===
    async getWorkers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._fetch(`${this.baseUrl}/workers/${query ? '?' + query : ''}`);
    }

    async getWorkerById(id) {
        return this._fetch(`${this.baseUrl}/workers/${id}`);
    }

    async createWorker(data) {
        return this._fetch(`${this.baseUrl}/workers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this._getAuthHeaders() },
            body: JSON.stringify(data)
        });
    }

    async registerWorker(formData) {
        return this._fetch(`${this.baseUrl}/workers/register`, {
            method: 'POST',
            body: formData
        });
    }

    async updateWorker(id, data) {
        return this._fetch(`${this.baseUrl}/workers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...this._getAuthHeaders() },
            body: JSON.stringify(data)
        });
    }

    async deleteWorker(id) {
        return this._fetch(`${this.baseUrl}/workers/${id}`, {
            method: 'DELETE',
            headers: { ...this._getAuthHeaders() }
        });
    }

    // === Reviews ===
    async getWorkerReviews(workerId) {
        return this._fetch(`${this.baseUrl}/workers/${workerId}/reviews`);
    }

    async createReview(workerId, data) {
        return this._fetch(`${this.baseUrl}/workers/${workerId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...this._getAuthHeaders() },
            body: JSON.stringify(data)
        });
    }

    // === Stats ===
    async getStats() {
        return this._fetch(`${this.baseUrl}/stats`);
    }

    // === Auth ===
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        return this._fetch(`${this.baseUrl}/token`, { method: 'POST', body: formData });
    }

    // === Contacts ===
    async submitContactRequest(data) {
        return this._fetch(`${this.baseUrl}/contacts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    async getContacts(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._fetch(`${this.baseUrl}/contacts/${query ? '?' + query : ''}`, {
            headers: { ...this._getAuthHeaders() }
        });
    }

    async markContactProcessed(id) {
        return this._fetch(`${this.baseUrl}/contacts/${id}/process`, {
            method: 'PATCH',
            headers: { ...this._getAuthHeaders() }
        });
    }
}

const api = new ApiService(API_BASE_URL);
