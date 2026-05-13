// API config
const API_BASE_URL = 'http://localhost:8000'; // Change in production

// Dummy data for initial demonstration before backend connects
const DUMMY_WORKERS = [
    {
        id: 1,
        full_name: 'Azamat Toshmatov',
        category: 'santexnik',
        city: 'Toshkent',
        experience_years: 8,
        avg_rating: 4.9,
        total_reviews: 124,
        price_range: 'Kelishilgan',
        description: 'Professional santexnik. Barcha turdagi quvurlarni almashtirish va isitish tizimlarini o\'rnatish.',
        is_verified: true,
        phone: '+998901234567'
    },
    {
        id: 2,
        full_name: 'Bobur Aliyev',
        category: 'elektrik',
        city: 'Toshkent',
        experience_years: 5,
        avg_rating: 4.7,
        total_reviews: 86,
        price_range: '50 000 so\'mdan',
        description: 'Rozetka, vikluchatel va noldan sim tortish xizmatlari. Sifatiga kafolat beraman.',
        is_verified: true,
        phone: '+998931112233'
    },
    {
        id: 3,
        full_name: 'Sanjar Karimberdiyev',
        category: 'umumiy_tamir',
        city: 'Samarqand',
        experience_years: 12,
        avg_rating: 5.0,
        total_reviews: 210,
        price_range: 'Kelishilgan',
        description: 'Yevro remont, kafellar terish, oboy yopishtirish va h.k. O\'z brigadamiz bor.',
        is_verified: true,
        phone: '+998977778899'
    },
    {
        id: 4,
        full_name: 'Dilshod Rahmatov',
        category: 'konditsioner',
        city: 'Toshkent',
        experience_years: 4,
        avg_rating: 4.5,
        total_reviews: 45,
        price_range: '100 000 so\'m/soat',
        description: 'Konditsioner o\'rnatish, tozalash va freon quyish. Tez va sifatli.',
        is_verified: false,
        phone: '+998994445566'
    }
];

// App State
let appState = {
    workers: [],
    currentCategory: 'all',
    currentSort: 'rating'
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Fetch and render workers
    fetchWorkers();
    
    // 2. Setup event listeners
    setupFilters();
    setupModals();
    setupSearch();
}

async function fetchWorkers() {
    const grid = document.getElementById('workersGrid');
    grid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Ustalar yuklanmoqda...</p>
        </div>
    `;

    try {
        // Fetch from real API using api.js
        appState.workers = await api.getWorkers();
    } catch (error) {
        console.warn('Using dummy data for demonstration', error);
        appState.workers = DUMMY_WORKERS;
    }

    renderWorkers();
}

function renderWorkers() {
    const grid = document.getElementById('workersGrid');
    grid.innerHTML = '';
    
    let filteredWorkers = appState.workers;
    
    // Apply category filter
    if (appState.currentCategory !== 'all') {
        filteredWorkers = filteredWorkers.filter(w => w.category === appState.currentCategory);
    }
    
    // Apply sorting
    if (appState.currentSort === 'rating') {
        filteredWorkers.sort((a, b) => b.avg_rating - a.avg_rating);
    } else if (appState.currentSort === 'experience') {
        filteredWorkers.sort((a, b) => b.experience_years - a.experience_years);
    }

    if (filteredWorkers.length === 0) {
        grid.innerHTML = '<p class="text-center w-100 mt-4">Bu toifada ustalar topilmadi.</p>';
        return;
    }

    filteredWorkers.forEach(worker => {
        const card = createWorkerCard(worker);
        grid.appendChild(card);
    });
}

function createWorkerCard(worker) {
    const div = document.createElement('div');
    div.className = 'worker-card';
    
    const categoryNames = {
        santexnik: 'Santexnik',
        elektrik: 'Elektrik',
        umumiy_tamir: "Ta'mirchi",
        konditsioner: "Konditsioner ustasi"
    };
    
    const categoryName = categoryNames[worker.category] || worker.category;
    const verifiedIcon = worker.is_verified ? '<i class="fa-solid fa-circle-check verified-badge" title="Tasdiqlangan"></i>' : '';
    
    const avatarContent = worker.photo_url 
        ? `<img src="${worker.photo_url}" alt="${worker.full_name}" class="worker-avatar">`
        : `<div class="worker-avatar"><i class="fa-solid fa-user"></i></div>`;

    div.innerHTML = `
        <div class="worker-header">
            ${avatarContent}
            <div class="worker-info">
                <h3>${worker.full_name} ${verifiedIcon}</h3>
                <span class="worker-category">${categoryName}</span>
                <div class="worker-rating">
                    <i class="fa-solid fa-star"></i>
                    <strong>${worker.avg_rating.toFixed(1)}</strong>
                    <span class="text-muted">(${worker.total_reviews} ta izoh)</span>
                </div>
            </div>
        </div>
        <div class="worker-body">
            <div class="worker-meta">
                <div><i class="fa-solid fa-briefcase"></i> ${worker.experience_years} yil tajriba</div>
                <div><i class="fa-solid fa-location-dot"></i> ${worker.city || 'Kiritilmagan'}</div>
            </div>
            <p class="worker-desc">${worker.description || 'Qisqacha ma\'lumot kiritilmagan.'}</p>
            <div class="worker-actions">
                <button class="btn btn-outline" onclick="showWorkerProfile(${worker.id})">Profilni ko'rish</button>
                <a href="tel:${worker.phone}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> Chaqirish</a>
            </div>
        </div>
    `;
    return div;
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    
    // Category tabs
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            appState.currentCategory = e.target.dataset.filter;
            renderWorkers();
        });
    });
    
    // Home category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.dataset.category;
            // Scroll to workers section
            document.getElementById('workers').scrollIntoView({ behavior: 'smooth' });
            
            // Set filter
            filterBtns.forEach(b => {
                b.classList.remove('active');
                if(b.dataset.filter === cat || (cat && !Array.from(filterBtns).find(fb=>fb.dataset.filter===cat) && b.dataset.filter==='all')) {
                    b.classList.add('active');
                }
            });
            
            appState.currentCategory = cat;
            renderWorkers();
        });
    });

    // Sort select
    sortSelect.addEventListener('change', (e) => {
        appState.currentSort = e.target.value;
        renderWorkers();
    });
}

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const citySelect = document.getElementById('citySelect');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        const city = citySelect.value;
        
        let filtered = appState.workers;
        
        if (query) {
            filtered = filtered.filter(w => 
                w.full_name.toLowerCase().includes(query) || 
                w.category.toLowerCase().includes(query) ||
                (w.description && w.description.toLowerCase().includes(query))
            );
        }
        
        if (city) {
            filtered = filtered.filter(w => w.city === city);
        }
        
        // Temporarily override render for search results
        const grid = document.getElementById('workersGrid');
        grid.innerHTML = '';
        
        if (filtered.length === 0) {
            grid.innerHTML = '<p class="text-center w-100 mt-4">Siz qidirgan mezonlar bo\'yicha usta topilmadi.</p>';
        } else {
            filtered.forEach(worker => {
                grid.appendChild(createWorkerCard(worker));
            });
        }
        
        document.getElementById('workers').scrollIntoView({ behavior: 'smooth' });
    });
}

function setupModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const workerModal = document.getElementById('workerModal');
    const closeBtns = document.querySelectorAll('.close-modal');

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === workerModal) workerModal.style.display = 'none';
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.textContent = 'Kirilmoqda...';
            submitBtn.disabled = true;
            
            const result = await api.login(username, password);
            localStorage.setItem('access_token', result.access_token);
            alert('Muvaffaqiyatli kirdingiz! (Admin panel tez orada qo\'shiladi)');
            loginModal.style.display = 'none';
        } catch (error) {
            alert('Login yoki parol noto\'g\'ri!');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Make globally available
window.showWorkerProfile = function(id) {
    const worker = appState.workers.find(w => w.id === id);
    if (!worker) return;
    
    const modal = document.getElementById('workerModal');
    const body = document.getElementById('modalBody');
    
    const categoryNames = {
        santexnik: 'Santexnik',
        elektrik: 'Elektrik',
        umumiy_tamir: "Ta'mirchi",
        konditsioner: "Konditsioner ustasi"
    };
    
    body.innerHTML = `
        <div class="text-center mb-4">
            <div class="worker-avatar mx-auto" style="width: 120px; height: 120px; font-size: 3rem; margin: 0 auto 20px;">
                <i class="fa-solid fa-user"></i>
            </div>
            <h2>${worker.full_name}</h2>
            <p class="text-muted">${categoryNames[worker.category] || worker.category}</p>
        </div>
        
        <div style="background: var(--bg-light); padding: 20px; border-radius: var(--radius-md); margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div><strong>Reyting:</strong> <i class="fa-solid fa-star" style="color:var(--warning)"></i> ${worker.avg_rating}</div>
                <div><strong>Tajriba:</strong> ${worker.experience_years} yil</div>
                <div><strong>Hudud:</strong> ${worker.city || 'Kiritilmagan'}</div>
                <div><strong>Narx:</strong> ${worker.price_range || 'Kelishilgan'}</div>
            </div>
        </div>
        
        <h3>O'zi haqida</h3>
        <p style="margin-bottom: 20px;">${worker.description || 'Ma\'lumot kiritilmagan'}</p>
        
        <div style="display: flex; gap: 15px;">
            <a href="tel:${worker.phone}" class="btn btn-primary w-100 text-center"><i class="fa-solid fa-phone"></i> Qo'ng'iroq qilish</a>
            <a href="https://t.me/SantexnikUz_bot?start=worker_${worker.id}" target="_blank" class="btn btn-outline w-100 text-center"><i class="fa-brands fa-telegram"></i> Bot orqali yozish</a>
        </div>
    `;
    
    modal.style.display = 'flex';
};
