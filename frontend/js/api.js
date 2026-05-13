// api.js - Centralized API calls

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async _fetch(url, options = {}) {
        if (!this.baseUrl) throw new Error('No API configured');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeout);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (e) {
            clearTimeout(timeout);
            throw e;
        }
    }

    async getWorkers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this._fetch(`${this.baseUrl}/workers/${query ? '?' + query : ''}`);
    }

    async getWorkerById(id) {
        return this._fetch(`${this.baseUrl}/workers/${id}`);
    }

    async getStats() {
        return this._fetch(`${this.baseUrl}/stats`);
    }

    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        return this._fetch(`${this.baseUrl}/token`, { method: 'POST', body: formData });
    }

    async submitContactRequest(data) {
        return this._fetch(`${this.baseUrl}/contacts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
}

const api = new ApiService(API_BASE_URL);
