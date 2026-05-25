// ================================================================
// Santexnik.uz — Admin Panel JavaScript v2.0
// ================================================================

// Security Check
if (!localStorage.getItem('access_token')) {
    window.location.href = 'index.html';
}

let adminState = {
    workers: [],
    leads: [],
    stats: null,
    deleteCandidateId: null
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupAdminUI();
    loadDashboardData();
});

// ===== Theme =====
function initTheme() {
    const saved = localStorage.getItem('santexnik-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            let next = 'light';
            if (current === 'light') next = 'dark';
            else if (current === 'dark') next = 'cyber';
            else next = 'light';

            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('santexnik-theme', next);
        });
    }
}

// ===== Setup UI & Events =====
function setupAdminUI() {
    // Admin Info
    const adminUser = localStorage.getItem('admin_user') || 'Admin';
    document.getElementById('adminNameDisplay').textContent = adminUser;
    document.getElementById('adminProfileName').textContent = adminUser;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('admin_user');
        window.location.href = 'index.html';
    });

    // Tabs
    const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.tab);
        });
    });

    // Modals
    const closeBtns = document.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Worker Form
    document.getElementById('adminWorkerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveWorker();
    });

    // Worker Search
    const searchInput = document.getElementById('workerSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderWorkersTable(searchInput.value.toLowerCase());
        });
    }

    // Delete Confirm Button
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
        if (adminState.deleteCandidateId) {
            await executeDeleteWorker(adminState.deleteCandidateId);
        }
    });
}

window.switchTab = function(tabId) {
    document.querySelectorAll('.admin-nav-item[data-tab]').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.tab === tabId) nav.classList.add('active');
    });
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById('tab-' + tabId).classList.add('active');

    // Load data based on tab
    if (tabId === 'dashboard') loadDashboardData();
    if (tabId === 'workers') loadWorkersData();
    if (tabId === 'leads') loadLeadsData();
};

window.closeModals = function() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById('adminWorkerForm').reset();
    document.getElementById('w_id').value = '';
    adminState.deleteCandidateId = null;
};

// ===== Toast Notification =====
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || 'fa-info-circle'}"></i> ${msg}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.color = '#fff';
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    toast.style.zIndex = '3000';
    toast.style.boxShadow = 'var(--shadow-lg)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== API Integration =====

async function loadDashboardData() {
    try {
        adminState.stats = await api.getStats();
        
        // Demo fallback for Vercel
        if (!adminState.stats || !adminState.stats.total_workers) {
            throw new Error('API down');
        }

        document.getElementById('dashTotalWorkers').textContent = adminState.stats.total_workers;
        document.getElementById('dashTotalReviews').textContent = adminState.stats.total_reviews;
        document.getElementById('dashAvgRating').textContent = adminState.stats.avg_rating.toFixed(1);
        
        // Count pending leads
        const leads = await api.getContacts();
        const pendingCount = leads.filter(l => !l.is_processed).length;
        document.getElementById('dashPendingLeads').textContent = pendingCount;
        
        // Recent workers
        const workers = await api.getWorkers();
        adminState.workers = workers;
        renderRecentWorkers(workers.slice(0, 5));

    } catch (e) {
        console.warn('Dashboard data fetch failed, using demo data', e);
        document.getElementById('dashTotalWorkers').textContent = '12';
        document.getElementById('dashTotalReviews').textContent = '45';
        document.getElementById('dashAvgRating').textContent = '4.8';
        document.getElementById('dashPendingLeads').textContent = '3';
    }
}

async function loadWorkersData() {
    try {
        adminState.workers = await api.getWorkers();
        renderWorkersTable();
    } catch (e) {
        showToast('Ustalarni yuklashda xatolik', 'error');
    }
}

async function loadLeadsData() {
    try {
        adminState.leads = await api.getContacts();
        renderLeadsTable();
        const pending = adminState.leads.filter(l => !l.is_processed).length;
        document.getElementById('leadsPendingCount').textContent = pending;
    } catch (e) {
        showToast('So\'rovlarni yuklashda xatolik', 'error');
    }
}

// ===== Render Logic =====

function getCategoryName(key) {
    const map = {
        santexnik:'Santexnik', elektrik:'Elektrik', umumiy_tamir:"Ta'mirchi",
        konditsioner:'Konditsioner', duradgor:'Duradgor', suvaqchi:'Suvaqchi',
        plitakash:'Plitakash', svarka:'Svarka', mebel_usta:'Mebel'
    };
    return map[key] || key;
}

function renderRecentWorkers(workers) {
    const tbody = document.getElementById('dashWorkersList');
    tbody.innerHTML = '';
    workers.forEach(w => {
        tbody.innerHTML += `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: var(--primary-glow); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary);"><i class="fa-solid fa-user"></i></div>
                        <span style="font-weight: 500;">${w.full_name}</span>
                    </div>
                </td>
                <td><span style="background:var(--bg-tertiary); padding:4px 10px; border-radius:20px; font-size:0.8rem;">${getCategoryName(w.category)}</span></td>
                <td>${w.city || '—'}</td>
                <td><i class="fa-solid fa-star" style="color: var(--warning);"></i> <strong>${w.avg_rating.toFixed(1)}</strong></td>
                <td>${w.is_active ? '<span class="status-badge status-active">Faol</span>' : '<span class="status-badge status-inactive">Nofaol</span>'}</td>
            </tr>
        `;
    });
}

function renderWorkersTable(filterText = '') {
    const tbody = document.getElementById('adminWorkersList');
    tbody.innerHTML = '';
    
    let filtered = adminState.workers;
    if (filterText) {
        filtered = filtered.filter(w => w.full_name.toLowerCase().includes(filterText) || w.phone.includes(filterText));
    }

    filtered.forEach(w => {
        tbody.innerHTML += `
            <tr>
                <td style="color:var(--text-muted);">#${w.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: var(--primary-glow); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary);"><i class="fa-solid fa-user"></i></div>
                        <span style="font-weight: 500;">${w.full_name}</span>
                    </div>
                </td>
                <td><span style="background:var(--bg-tertiary); padding:4px 10px; border-radius:20px; font-size:0.8rem;">${getCategoryName(w.category)}</span></td>
                <td>${w.phone}</td>
                <td>${w.is_active ? '<span class="status-badge status-active">Faol</span>' : '<span class="status-badge status-inactive">Nofaol</span>'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" title="Tahrirlash" onclick="openWorkerModal(${w.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon btn-delete" title="O'chirish" onclick="confirmDelete(${w.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderLeadsTable() {
    const tbody = document.getElementById('adminLeadsList');
    tbody.innerHTML = '';
    
    adminState.leads.forEach(l => {
        const date = new Date(l.created_at).toLocaleString('uz-UZ');
        const statusHtml = l.is_processed 
            ? '<span class="status-badge status-active">Bajarildi</span>' 
            : '<span class="status-badge status-pending">Yangi</span>';
            
        const actionHtml = l.is_processed
            ? '<span style="color:var(--text-muted);font-size:0.85rem;"><i class="fa-solid fa-check-double"></i> Yopilgan</span>'
            : `<button class="btn-icon btn-check" title="Bajarildi deb belgilash" onclick="processLead(${l.id})"><i class="fa-solid fa-check"></i></button>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${l.name}</strong></td>
                <td><a href="tel:${l.phone}" style="color:var(--primary);">${l.phone}</a></td>
                <td>${getCategoryName(l.category) || '—'}</td>
                <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${l.message || ''}">${l.message || '—'}</td>
                <td style="font-size:0.85rem; color:var(--text-muted);">${date}</td>
                <td>${statusHtml}</td>
                <td><div class="action-btns">${actionHtml}</div></td>
            </tr>
        `;
    });
}

// ===== Worker CRUD Actions =====

window.openWorkerModal = function(id = null) {
    const modal = document.getElementById('adminWorkerModal');
    const form = document.getElementById('adminWorkerForm');
    const title = document.getElementById('workerModalTitle');
    form.reset();
    
    if (id) {
        title.textContent = "Ustani tahrirlash";
        const w = adminState.workers.find(x => x.id === id);
        if (w) {
            document.getElementById('w_id').value = w.id;
            document.getElementById('w_full_name').value = w.full_name;
            document.getElementById('w_phone').value = w.phone;
            document.getElementById('w_category').value = w.category;
            document.getElementById('w_experience_years').value = w.experience_years;
            document.getElementById('w_city').value = w.city || '';
            document.getElementById('w_address').value = w.address || '';
            document.getElementById('w_price_range').value = w.price_range || '';
            document.getElementById('w_telegram_username').value = w.telegram_username || '';
            document.getElementById('w_description').value = w.description || '';
            document.getElementById('w_is_active').checked = w.is_active;
        }
    } else {
        title.textContent = "Yangi usta qo'shish";
        document.getElementById('w_id').value = '';
        document.getElementById('w_is_active').checked = true;
    }
    
    modal.style.display = 'flex';
};

async function saveWorker() {
    const btn = document.getElementById('saveWorkerBtn');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const id = document.getElementById('w_id').value;
        const data = {
            full_name: document.getElementById('w_full_name').value,
            phone: document.getElementById('w_phone').value,
            category: document.getElementById('w_category').value,
            experience_years: parseInt(document.getElementById('w_experience_years').value) || 0,
            city: document.getElementById('w_city').value || null,
            address: document.getElementById('w_address').value || null,
            price_range: document.getElementById('w_price_range').value || null,
            telegram_username: document.getElementById('w_telegram_username').value || null,
            description: document.getElementById('w_description').value || null,
        };
        
        // For update, we also pass is_active
        if (id) {
            data.is_active = document.getElementById('w_is_active').checked;
            await api.updateWorker(id, data);
            showToast('Usta ma\'lumotlari yangilandi', 'success');
        } else {
            await api.createWorker(data);
            showToast('Yangi usta muvaffaqiyatli qo\'shildi', 'success');
        }
        
        closeModals();
        loadWorkersData();
        loadDashboardData();
    } catch (e) {
        showToast('Xatolik yuz berdi: ' + e.message, 'error');
    } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
    }
}

window.confirmDelete = function(id) {
    adminState.deleteCandidateId = id;
    document.getElementById('confirmDeleteModal').style.display = 'flex';
};

async function executeDeleteWorker(id) {
    const btn = document.getElementById('confirmDeleteBtn');
    const origText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        await api.deleteWorker(id);
        showToast('Usta muvaffaqiyatli o\'chirildi', 'success');
        closeModals();
        loadWorkersData();
        loadDashboardData();
    } catch (e) {
        showToast('Xatolik yuz berdi', 'error');
    } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
    }
}

// ===== Leads Action =====

window.processLead = async function(id) {
    try {
        await api.markContactProcessed(id);
        showToast('So\'rov bajarildi deb belgilandi', 'success');
        loadLeadsData();
        loadDashboardData();
    } catch (e) {
        showToast('Xatolik yuz berdi', 'error');
    }
};
