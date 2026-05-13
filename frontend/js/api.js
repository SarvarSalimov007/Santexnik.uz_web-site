// api.js - Centralized API calls

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getWorkers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}/workers/${query ? '?' + query : ''}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async getWorkerById(id) {
        const response = await fetch(`${this.baseUrl}/workers/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async getStats() {
        const response = await fetch(`${this.baseUrl}/stats`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await fetch(`${this.baseUrl}/token`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error('Login failed');
        return await response.json();
    }

    async submitContactRequest(data) {
        const response = await fetch(`${this.baseUrl}/contacts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }
}

const api = new ApiService(API_BASE_URL);
