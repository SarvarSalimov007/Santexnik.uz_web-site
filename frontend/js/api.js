// api.js - Centralized API calls for Santexnik.uz

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://santexnik.uz/api';
const IS_DEMO = true; // Taqdimot (Vercel) uchun mock data (qalbaki baza) yoqilgan

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        if (IS_DEMO) {
            this._initMockDb();
        }
    }

    _initMockDb() {
        if (!localStorage.getItem('mock_workers')) {
            localStorage.setItem('mock_workers', JSON.stringify([
                { id: 1, full_name: "Aziz Nematov", phone: "+998901234567", category: "santexnik", experience_years: 5, city: "Toshkent shahri", is_active: true, avg_rating: 4.8, total_reviews: 12 },
                { id: 2, full_name: "Javohir Tursunov", phone: "+998931234567", category: "elektrik", experience_years: 3, city: "Samarqand viloyati", is_active: true, avg_rating: 4.5, total_reviews: 5 }
            ]));
        }
        if (!localStorage.getItem('mock_contacts')) {
            localStorage.setItem('mock_contacts', JSON.stringify([]));
        }
    }

    _getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    _mockFetch(url, options = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const method = options.method || 'GET';
                let workers = JSON.parse(localStorage.getItem('mock_workers'));
                let contacts = JSON.parse(localStorage.getItem('mock_contacts'));

                if (url.includes('/workers/register') && method === 'POST') {
                    const formData = options.body;
                    const newWorker = {
                        id: Date.now(),
                        full_name: formData.get('full_name') || 'Yangi Usta',
                        phone: formData.get('phone') || '',
                        category: formData.get('category') || 'umumiy_tamir',
                        experience_years: parseInt(formData.get('experience_years') || 0),
                        city: formData.get('city') || '',
                        address: formData.get('address') || '',
                        description: formData.get('description') || '',
                        price_range: formData.get('price_range') || '',
                        telegram_username: formData.get('telegram_username') || '',
                        is_active: false,
                        avg_rating: 0,
                        total_reviews: 0,
                        created_at: new Date().toISOString()
                    };
                    workers.push(newWorker);
                    localStorage.setItem('mock_workers', JSON.stringify(workers));
                    resolve(newWorker);
                    return;
                }

                if (url.includes('/workers') && method === 'GET') {
                    resolve(workers.sort((a,b) => b.id - a.id));
                    return;
                }

                if (url.includes('/workers/') && method === 'PUT') {
                    const idStr = url.split('/workers/')[1];
                    const id = parseInt(idStr);
                    const updateData = JSON.parse(options.body);
                    const idx = workers.findIndex(w => w.id === id);
                    if (idx > -1) {
                        workers[idx] = { ...workers[idx], ...updateData };
                        localStorage.setItem('mock_workers', JSON.stringify(workers));
                        resolve(workers[idx]);
                    } else {
                        resolve(null);
                    }
                    return;
                }

                if (url.includes('/workers/') && method === 'DELETE') {
                    const idStr = url.split('/workers/')[1];
                    const id = parseInt(idStr);
                    workers = workers.filter(w => w.id !== id);
                    localStorage.setItem('mock_workers', JSON.stringify(workers));
                    resolve({ success: true });
                    return;
                }

                if (url.includes('/workers') && method === 'POST') {
                    const data = JSON.parse(options.body);
                    data.id = Date.now();
                    data.avg_rating = 0;
                    data.total_reviews = 0;
                    data.created_at = new Date().toISOString();
                    workers.push(data);
                    localStorage.setItem('mock_workers', JSON.stringify(workers));
                    resolve(data);
                    return;
                }

                if (url.includes('/contacts') && method === 'GET') {
                    resolve(contacts.sort((a,b) => b.id - a.id));
                    return;
                }

                if (url.includes('/contacts') && method === 'POST') {
                    const data = JSON.parse(options.body);
                    data.id = Date.now();
                    data.is_processed = false;
                    data.created_at = new Date().toISOString();
                    contacts.push(data);
                    localStorage.setItem('mock_contacts', JSON.stringify(contacts));
                    resolve(data);
                    return;
                }

                if (url.includes('/contacts/') && method === 'PATCH') {
                    const idStr = url.split('/contacts/')[1].split('/')[0];
                    const id = parseInt(idStr);
                    const idx = contacts.findIndex(c => c.id === id);
                    if (idx > -1) {
                        contacts[idx].is_processed = true;
                        localStorage.setItem('mock_contacts', JSON.stringify(contacts));
                        resolve(contacts[idx]);
                    } else {
                        resolve(null);
                    }
                    return;
                }

                if (url.includes('/stats')) {
                    resolve({
                        total_workers: workers.length,
                        total_reviews: workers.reduce((acc, w) => acc + w.total_reviews, 0),
                        avg_rating: workers.length ? (workers.reduce((acc, w) => acc + w.avg_rating, 0) / workers.length) : 0,
                        categories: {}
                    });
                    return;
                }

                if (url.includes('/token')) {
                    const username = options.body.get('username');
                    const password = options.body.get('password');
                    if (username === 'Sarvar' && password === 'exa1122211') {
                        resolve({ access_token: 'demo_token' });
                    } else {
                        // Reject manually simulating HTTP 401
                        resolve(Promise.reject(new Error("Login yoki parol noto'g'ri!")));
                    }
                    return;
                }

                resolve({ success: true });
            }, 400); // Simulate network delay
        });
    }

    async _fetch(url, options = {}) {
        if (IS_DEMO) {
            return this._mockFetch(url, options);
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
