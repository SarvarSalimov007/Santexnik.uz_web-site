// API config - 'http://localhost:8000' for local dev, '' for static deploy (Vercel)
const API_BASE_URL = '';

// Dummy data for demonstration
const DUMMY_WORKERS = [
    { id:1, full_name:'Azamat Toshmatov', category:'santexnik', city:'Toshkent', experience_years:8, avg_rating:4.9, total_reviews:124, price_range:'Kelishilgan', description:"Professional santexnik. Barcha turdagi quvurlarni almashtirish va isitish tizimlarini o'rnatish.", is_verified:true, phone:'+998901234567', telegram_username:'azamat_santexnik' },
    { id:2, full_name:'Bobur Aliyev', category:'elektrik', city:'Toshkent', experience_years:5, avg_rating:4.7, total_reviews:86, price_range:"50 000 so'mdan", description:"Rozetka, vikluchatel va noldan sim tortish xizmatlari. Sifatiga kafolat beraman.", is_verified:true, phone:'+998931112233', telegram_username:'bobur_elektrik' },
    { id:3, full_name:'Sanjar Karimberdiyev', category:'umumiy_tamir', city:'Samarqand', experience_years:12, avg_rating:5.0, total_reviews:210, price_range:'Kelishilgan', description:"Yevro remont, kafellar terish, oboy yopishtirish va h.k. O'z brigadamiz bor.", is_verified:true, phone:'+998977778899' },
    { id:4, full_name:'Dilshod Rahmatov', category:'konditsioner', city:'Toshkent', experience_years:4, avg_rating:4.5, total_reviews:45, price_range:"100 000 so'm/soat", description:"Konditsioner o'rnatish, tozalash va freon quyish. Tez va sifatli.", is_verified:false, phone:'+998994445566' },
    { id:5, full_name:'Jasur Mamatov', category:'duradgor', city:'Toshkent', experience_years:15, avg_rating:4.8, total_reviews:67, price_range:"80 000 so'mdan", description:"Professional duradgor. Eshiklar, derazalar va yog'och konstruktsiyalar.", is_verified:true, phone:'+998905556677' },
    { id:6, full_name:'Ulugbek Normatov', category:'suvaqchi', city:"Farg'ona", experience_years:10, avg_rating:4.6, total_reviews:53, price_range:'Kelishilgan', description:"Suvoq ishlari, devorlarni tekislash va dekorativ suvoq.", is_verified:true, phone:'+998917778899' },
    { id:7, full_name:'Mirzo Karimov', category:'plitakash', city:'Toshkent', experience_years:6, avg_rating:4.4, total_reviews:38, price_range:"70 000 so'm/m²", description:"Kafel va plitka terish ustasi. Hammom, oshxona va pol.", is_verified:false, phone:'+998933334455' },
    { id:8, full_name:'Farhod Eshmatov', category:'svarka', city:'Andijon', experience_years:20, avg_rating:4.9, total_reviews:178, price_range:'Kelishilgan', description:"Svarka ishlari. Temir darvoza, panjara, metall konstruktsiyalar.", is_verified:true, phone:'+998909998877' }
];

const CATEGORY_NAMES = {
    santexnik:'Santexnik', elektrik:'Elektrik', umumiy_tamir:"Ta'mirchi",
    konditsioner:'Konditsioner ustasi', duradgor:'Duradgor', suvaqchi:'Suvaqchi',
    plitakash:'Plitakash', svarka:'Svarkachi', mebel_usta:'Mebel ustasi',
    rassomchi:'Rassomchi', tom_yopish:'Tom yopish ustasi', temirbeton:'Temirbeton ustasi'
};

// App State
let appState = { workers: [], currentCategory: 'all', currentSort: 'rating' };

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initScrollAnimations();
    initMobileMenu();
    initScrollTop();
    initNavbarScroll();
});

function initApp() {
    fetchWorkers();
    fetchStats();
    setupFilters();
    setupModals();
    setupSearch();
    setupContactForm();
}

// ===== Data Fetching =====
async function fetchWorkers() {
    const grid = document.getElementById('workersGrid');
    grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Ustalar yuklanmoqda...</p></div>';
    try {
        appState.workers = await api.getWorkers();
    } catch (e) {
        console.warn('Using dummy data', e);
        appState.workers = DUMMY_WORKERS;
    }
    renderWorkers();
}

async function fetchStats() {
    let stats;
    try {
        stats = await api.getStats();
    } catch (e) {
        stats = { total_workers: DUMMY_WORKERS.length, total_reviews: 803, avg_rating: 4.7, categories: { santexnik:1, elektrik:1, umumiy_tamir:1, konditsioner:1, duradgor:1, suvaqchi:1, plitakash:1, svarka:1 } };
    }
    animateCounter('statWorkers', stats.total_workers || 0);
    animateCounter('statReviews', stats.total_reviews || 0);
    animateCounter('statRating', stats.avg_rating || 0, true);
    animateCounter('statCategories', Object.keys(stats.categories || {}).length || 8);
    const heroCount = document.getElementById('workerCountHero');
    if (heroCount) heroCount.textContent = `${stats.total_workers || '500+'}+ Ustalar`;
}

function animateCounter(id, target, isFloat = false) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
    }, 30);
}

// ===== Rendering =====
function renderWorkers() {
    const grid = document.getElementById('workersGrid');
    grid.innerHTML = '';
    let filtered = appState.workers;
    if (appState.currentCategory !== 'all') {
        filtered = filtered.filter(w => w.category === appState.currentCategory);
    }
    if (appState.currentSort === 'rating') filtered.sort((a, b) => b.avg_rating - a.avg_rating);
    else if (appState.currentSort === 'experience') filtered.sort((a, b) => b.experience_years - a.experience_years);

    if (!filtered.length) {
        grid.innerHTML = '<p class="text-center w-100 mt-4">Bu toifada ustalar topilmadi.</p>';
        return;
    }
    filtered.forEach((w, i) => {
        const card = createWorkerCard(w);
        card.style.animationDelay = `${i * 0.08}s`;
        card.classList.add('fade-up', 'visible');
        grid.appendChild(card);
    });
}

function createWorkerCard(worker) {
    const div = document.createElement('div');
    div.className = 'worker-card';
    const catName = CATEGORY_NAMES[worker.category] || worker.category;
    const verified = worker.is_verified ? '<i class="fa-solid fa-circle-check verified-badge" title="Tasdiqlangan"></i>' : '';
    const avatar = worker.photo_url
        ? `<img src="${worker.photo_url}" alt="${worker.full_name}" class="worker-avatar">`
        : `<div class="worker-avatar"><i class="fa-solid fa-user"></i></div>`;
    div.innerHTML = `
        <div class="worker-header">
            ${avatar}
            <div class="worker-info">
                <h3>${worker.full_name} ${verified}</h3>
                <span class="worker-category">${catName}</span>
                <div class="worker-rating">
                    <i class="fa-solid fa-star"></i>
                    <strong>${worker.avg_rating.toFixed(1)}</strong>
                    <span style="color:var(--text-muted)">(${worker.total_reviews} ta izoh)</span>
                </div>
            </div>
        </div>
        <div class="worker-body">
            <div class="worker-meta">
                <div><i class="fa-solid fa-briefcase"></i> ${worker.experience_years} yil</div>
                <div><i class="fa-solid fa-location-dot"></i> ${worker.city || 'Kiritilmagan'}</div>
                <div><i class="fa-solid fa-coins"></i> ${worker.price_range || 'Kelishilgan'}</div>
            </div>
            <p class="worker-desc">${worker.description || "Qisqacha ma'lumot kiritilmagan."}</p>
            <div class="worker-actions">
                <button class="btn btn-outline" onclick="showWorkerProfile(${worker.id})">Profilni ko'rish</button>
                <a href="tel:${worker.phone}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> Chaqirish</a>
            </div>
        </div>`;
    return div;
}

// ===== Filters & Search =====
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            appState.currentCategory = e.target.dataset.filter;
            renderWorkers();
        });
    });
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const cat = card.dataset.category;
            document.getElementById('workers').scrollIntoView({ behavior: 'smooth' });
            filterBtns.forEach(b => {
                b.classList.remove('active');
                if (b.dataset.filter === cat) b.classList.add('active');
            });
            if (![...filterBtns].find(b => b.dataset.filter === cat)) {
                filterBtns.forEach(b => { if (b.dataset.filter === 'all') b.classList.add('active'); });
            }
            appState.currentCategory = cat;
            renderWorkers();
        });
    });
    sortSelect.addEventListener('change', e => {
        appState.currentSort = e.target.value;
        renderWorkers();
    });
}

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const citySelect = document.getElementById('citySelect');
    const doSearch = () => {
        const query = searchInput.value.toLowerCase();
        const city = citySelect.value;
        let filtered = appState.workers;
        if (query) filtered = filtered.filter(w =>
            w.full_name.toLowerCase().includes(query) ||
            w.category.toLowerCase().includes(query) ||
            (CATEGORY_NAMES[w.category] || '').toLowerCase().includes(query) ||
            (w.description && w.description.toLowerCase().includes(query))
        );
        if (city) filtered = filtered.filter(w => w.city === city);
        const grid = document.getElementById('workersGrid');
        grid.innerHTML = '';
        if (!filtered.length) {
            grid.innerHTML = "<p class='text-center w-100 mt-4'>Siz qidirgan mezonlar bo'yicha usta topilmadi.</p>";
        } else {
            filtered.forEach(w => grid.appendChild(createWorkerCard(w)));
        }
        document.getElementById('workers').scrollIntoView({ behavior: 'smooth' });
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ===== Modals =====
function setupModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const workerModal = document.getElementById('workerModal');
    const closeBtns = document.querySelectorAll('.close-modal');

    loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    closeBtns.forEach(btn => btn.addEventListener('click', function () { this.closest('.modal').style.display = 'none'; }));
    window.addEventListener('click', e => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === workerModal) workerModal.style.display = 'none';
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            loginModal.style.display = 'none';
            workerModal.style.display = 'none';
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async e => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button[type="submit"]');
        const orig = btn.textContent;
        try {
            btn.textContent = 'Kirilmoqda...';
            btn.disabled = true;
            const result = await api.login(username, password);
            localStorage.setItem('access_token', result.access_token);
            showToast('Muvaffaqiyatli kirdingiz!', 'success');
            loginModal.style.display = 'none';
        } catch (err) {
            showToast("Login yoki parol noto'g'ri!", 'error');
        } finally {
            btn.textContent = orig;
            btn.disabled = false;
        }
    });
}

// ===== Contact Form =====
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = form.querySelector('.btn-submit');
        const orig = btn.innerHTML;
        btn.innerHTML = 'Yuborilmoqda... <i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;
        const data = {
            name: document.getElementById('contactName').value,
            phone: document.getElementById('contactPhone').value,
            category: document.getElementById('contactCategory').value || null,
            message: document.getElementById('contactMessage').value || null
        };
        try {
            await api.submitContactRequest(data);
            showToast("So'rov muvaffaqiyatli yuborildi! Tez orada bog'lanamiz.", 'success');
            form.reset();
        } catch (err) {
            showToast("Xatolik yuz berdi. Keyinroq urinib ko'ring.", 'error');
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
}

// ===== Worker Profile Modal =====
window.showWorkerProfile = function (id) {
    const worker = appState.workers.find(w => w.id === id);
    if (!worker) return;
    const modal = document.getElementById('workerModal');
    const body = document.getElementById('modalBody');
    const catName = CATEGORY_NAMES[worker.category] || worker.category;
    const tgLink = worker.telegram_username
        ? `<a href="https://t.me/${worker.telegram_username}" target="_blank" class="btn btn-outline w-100 text-center"><i class="fa-brands fa-telegram"></i> Telegram</a>`
        : `<a href="https://t.me/SantexnikUz_bot?start=worker_${worker.id}" target="_blank" class="btn btn-outline w-100 text-center"><i class="fa-brands fa-telegram"></i> Bot orqali</a>`;
    body.innerHTML = `
        <div class="text-center" style="margin-bottom:24px">
            <div class="worker-avatar" style="width:100px;height:100px;font-size:2.5rem;margin:0 auto 16px;background:linear-gradient(135deg,#eef2ff,#e0e7ff);color:var(--primary)">
                <i class="fa-solid fa-user"></i>
            </div>
            <h2 style="margin-bottom:6px">${worker.full_name}</h2>
            <span class="worker-category" style="font-size:.85rem">${catName}</span>
        </div>
        <div style="background:var(--bg-light);padding:20px;border-radius:var(--radius-lg);margin-bottom:22px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:.95rem">
                <div><strong>Reyting:</strong> <i class="fa-solid fa-star" style="color:var(--accent)"></i> ${worker.avg_rating} (${worker.total_reviews})</div>
                <div><strong>Tajriba:</strong> ${worker.experience_years} yil</div>
                <div><strong>Hudud:</strong> ${worker.city || 'Kiritilmagan'}</div>
                <div><strong>Narx:</strong> ${worker.price_range || 'Kelishilgan'}</div>
            </div>
        </div>
        <h3 style="margin-bottom:10px">O'zi haqida</h3>
        <p style="margin-bottom:22px;color:var(--text-muted);line-height:1.7">${worker.description || "Ma'lumot kiritilmagan"}</p>
        <div style="display:flex;gap:12px">
            <a href="tel:${worker.phone}" class="btn btn-primary w-100 text-center"><i class="fa-solid fa-phone"></i> Qo'ng'iroq</a>
            ${tgLink}
        </div>`;
    modal.style.display = 'flex';
};

// ===== Toast Notifications =====
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const close = document.getElementById('mobileMenuClose');
    const open = () => { menu.classList.add('open'); overlay.classList.add('open'); };
    const shut = () => { menu.classList.remove('open'); overlay.classList.remove('open'); };
    btn.addEventListener('click', open);
    close.addEventListener('click', shut);
    overlay.addEventListener('click', shut);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
}

// ===== Scroll Top =====
function initScrollTop() {
    const btn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== Navbar Scroll =====
function initNavbarScroll() {
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });
    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute('id');
        });
        navLinks.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === '#' + current) a.classList.add('active');
        });
    });
}
