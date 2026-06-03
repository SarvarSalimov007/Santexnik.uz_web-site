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
            return Promise.resolve({ total_workers: 120, total_reviews: 450, avg_rating: 4.8, categories: {} });
        }
        if (url.includes('/workers') && (!options.method || options.method === 'GET')) {
            if (url.match(/\/workers\/\d+\/reviews/)) return Promise.resolve([]);
            return Promise.resolve([
                { id: 1, full_name: 'Sarvar Usta', category: 'santexnik', avg_rating: 4.9, experience_years: 5, city: 'Toshkent', price_range: 'Kelishilgan', total_reviews: 24, is_verified: true },
                { id: 2, full_name: 'Ali Elektrik', category: 'elektrik', avg_rating: 4.7, experience_years: 3, city: 'Samarqand', price_range: 'Kelishilgan', total_reviews: 15, is_verified: false },
                { id: 3, full_name: 'Aziz Ta\'mirchi', category: 'umumiy_tamir', avg_rating: 5.0, experience_years: 8, city: 'Buxoro', price_range: 'Kelishilgan', total_reviews: 50, is_verified: true }
            ]);
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
