// ================================================================
// Santexnik.uz — Frontend Application v2.0
// ================================================================

// Dummy data for demonstration (when API is unavailable)
const DUMMY_WORKERS = [
    { id:1, full_name:'Azamat Toshmatov', category:'santexnik', city:'Toshkent shahri', address:'Yunusobod tumani', experience_years:8, avg_rating:4.9, total_reviews:124, price_range:'Kelishilgan', description:"Professional santexnik. Barcha turdagi quvurlarni almashtirish va isitish tizimlarini o'rnatish.", is_verified:true, is_active:true, phone:'+998901234567', telegram_username:'azamat_santexnik' },
    { id:2, full_name:'Bobur Aliyev', category:'elektrik', city:'Toshkent shahri', address:'Chilonzor tumani', experience_years:5, avg_rating:4.7, total_reviews:86, price_range:"50 000 so'mdan", description:"Rozetka, vikluchatel va noldan sim tortish xizmatlari. Sifatiga kafolat beraman.", is_verified:true, is_active:true, phone:'+998931112233', telegram_username:'bobur_elektrik' },
    { id:3, full_name:'Sanjar Karimberdiyev', category:'umumiy_tamir', city:'Samarqand viloyati', address:'Samarqand shahri', experience_years:12, avg_rating:5.0, total_reviews:210, price_range:'Kelishilgan', description:"Yevro remont, kafellar terish, oboy yopishtirish va h.k. O'z brigadamiz bor.", is_verified:true, is_active:true, phone:'+998977778899' },
    { id:4, full_name:'Dilshod Rahmatov', category:'konditsioner', city:'Toshkent shahri', address:"Mirzo Ulug'bek tumani", experience_years:4, avg_rating:4.5, total_reviews:45, price_range:"100 000 so'm/soat", description:"Konditsioner o'rnatish, tozalash va freon quyish. Tez va sifatli.", is_verified:false, is_active:true, phone:'+998994445566' },
    { id:5, full_name:'Jasur Mamatov', category:'duradgor', city:'Toshkent shahri', address:'Uchtepa tumani', experience_years:15, avg_rating:4.8, total_reviews:67, price_range:"80 000 so'mdan", description:"Professional duradgor. Eshiklar, derazalar va yog'och konstruktsiyalar.", is_verified:true, is_active:true, phone:'+998905556677' },
    { id:6, full_name:'Ulugbek Normatov', category:'suvaqchi', city:"Farg'ona viloyati", address:"Farg'ona shahri", experience_years:10, avg_rating:4.6, total_reviews:53, price_range:'Kelishilgan', description:"Suvoq ishlari, devorlarni tekislash va dekorativ suvoq.", is_verified:true, is_active:true, phone:'+998917778899' },
    { id:7, full_name:'Mirzo Karimov', category:'plitakash', city:'Toshkent shahri', address:'Olmazor tumani', experience_years:6, avg_rating:4.4, total_reviews:38, price_range:"70 000 so'm/m²", description:"Kafel va plitka terish ustasi. Hammom, oshxona va pol.", is_verified:false, is_active:true, phone:'+998933334455' },
    { id:8, full_name:'Farhod Eshmatov', category:'svarka', city:'Andijon viloyati', address:'Andijon shahri', experience_years:20, avg_rating:4.9, total_reviews:178, price_range:'Kelishilgan', description:"Svarka ishlari. Temir darvoza, panjara, metall konstruktsiyalar.", is_verified:true, is_active:true, phone:'+998909998877' }
];

const CATEGORY_NAMES = {
    santexnik:'Santexnik', elektrik:'Elektrik', umumiy_tamir:"Ta'mirchi",
    konditsioner:'Konditsioner ustasi', duradgor:'Duradgor', suvaqchi:'Suvaqchi',
    plitakash:'Plitakash', svarka:'Svarkachi', mebel_usta:'Mebel ustasi',
    rassomchi:'Rassomchi', tom_yopish:'Tom yopish ustasi', temirbeton:'Temirbeton ustasi'
};

const CATEGORY_ICONS = {
    santexnik:'fa-faucet-drip', elektrik:'fa-bolt', umumiy_tamir:'fa-hammer',
    konditsioner:'fa-snowflake', duradgor:'fa-screwdriver-wrench', suvaqchi:'fa-trowel-bricks',
    plitakash:'fa-border-all', svarka:'fa-fire', mebel_usta:'fa-couch',
    rassomchi:'fa-paint-roller', tom_yopish:'fa-house-chimney', temirbeton:'fa-building'
};

// App State
let appState = { workers: [], currentCategory: 'all', currentSort: 'rating' };

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguageSwitcher();
    initApp();
    initScrollAnimations();
    initMobileMenu();
    initScrollTop();
    initNavbarScroll();
});

function initApp() {
    fetchWorkers();
    fetchStats();
    initLocations();
    setupFilters();
    setupModals();
    setupSearch();
    setupContactForm();
}

// ===== Theme System (Single Cycle Button) =====
const THEME_ORDER = ['light', 'dark', 'cyber'];
const THEME_ICONS = { light: 'fa-sun', dark: 'fa-moon', cyber: 'fa-bolt' };
const THEME_LABELS = {
    light: { uz: "Yorug' rejim", uz_cyrl: "Ёруғ режим", en: "Light mode", ru: "Светлый режим", tj: "Реҷаи равшан" },
    dark: { uz: "Qorong'i rejim", uz_cyrl: "Қоронғи режим", en: "Dark mode", ru: "Тёмный режим", tj: "Реҷаи торик" },
    cyber: { uz: "Kiber rejim", uz_cyrl: "Кибер режим", en: "Cyber mode", ru: "Кибер режим", tj: "Реҷаи кибер" }
};

function initTheme() {
    const saved = localStorage.getItem('santexnik-theme') || 'light';
    applyTheme(saved);

    // Desktop cycle button
    const cycleBtn = document.getElementById('themeCycleBtn');
    if (cycleBtn) {
        cycleBtn.addEventListener('click', () => {
            cycleTheme();
        });
    }

    // Mobile cycle button
    const mobileCycleBtn = document.getElementById('mobileThemeCycleBtn');
    if (mobileCycleBtn) {
        mobileCycleBtn.addEventListener('click', () => {
            cycleTheme();
        });
    }
}

function cycleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const currentIndex = THEME_ORDER.indexOf(current);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    const nextTheme = THEME_ORDER[nextIndex];
    applyTheme(nextTheme);
    localStorage.setItem('santexnik-theme', nextTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = THEME_ICONS[theme] || 'fa-sun';
    const lang = (typeof getCurrentLanguage === 'function') ? getCurrentLanguage() : 'uz';
    const label = (THEME_LABELS[theme] && THEME_LABELS[theme][lang]) || THEME_LABELS[theme]?.uz || theme;

    // Update desktop button icon
    const cycleBtn = document.getElementById('themeCycleBtn');
    if (cycleBtn) {
        const iconEl = cycleBtn.querySelector('i');
        if (iconEl) {
            iconEl.className = `fa-solid ${icon}`;
        }
        cycleBtn.title = label;
    }

    // Update mobile button icon and text
    const mobileCycleBtn = document.getElementById('mobileThemeCycleBtn');
    if (mobileCycleBtn) {
        const iconEl = mobileCycleBtn.querySelector('i');
        if (iconEl) {
            iconEl.className = `fa-solid ${icon}`;
        }
        // Find the next theme to show what clicking will switch to
        const nextIndex = (THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length;
        const nextTheme = THEME_ORDER[nextIndex];
        const nextLabel = (THEME_LABELS[nextTheme] && THEME_LABELS[nextTheme][lang]) || THEME_LABELS[nextTheme]?.uz || nextTheme;
        const spanEl = mobileCycleBtn.querySelector('span');
        if (spanEl) {
            spanEl.textContent = label;
        }
        mobileCycleBtn.title = label;
    }
}

// ===== Locations =====
function initLocations() {
    const citySelect = document.getElementById('citySelect');
    const districtSelect = document.getElementById('districtSelect');
    const regCitySelect = document.getElementById('regCitySelect');
    const regDistrictSelect = document.getElementById('regDistrictSelect');

    if (typeof UZ_LOCATIONS === 'undefined') return;

    for (const region in UZ_LOCATIONS) {
        if(citySelect) {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            citySelect.appendChild(option);
        }
        if(regCitySelect) {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regCitySelect.appendChild(option);
        }
    }

    if(citySelect) {
        citySelect.addEventListener('change', () => {
            const region = citySelect.value;
            districtSelect.innerHTML = '<option value="">Barcha tumanlar</option>';
            if (region && UZ_LOCATIONS[region]) {
                UZ_LOCATIONS[region].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
            }
        });
    }

    if(regCitySelect) {
        regCitySelect.addEventListener('change', () => {
            const region = regCitySelect.value;
            regDistrictSelect.innerHTML = '<option value="">Tuman/Manzilni tanlang</option>';
            if (region && UZ_LOCATIONS[region]) {
                UZ_LOCATIONS[region].forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    regDistrictSelect.appendChild(option);
                });
            }
        });
    }
}

// ===== Data Fetching =====
async function fetchWorkers() {
    const grid = document.getElementById('workersGrid');
    const loadingText = typeof t === 'function' ? t('loading_workers') : 'Ustalar yuklanmoqda...';
    grid.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>${loadingText}</p></div>`;
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
        stats = {
            total_workers: DUMMY_WORKERS.length,
            total_reviews: 803,
            avg_rating: 4.7,
            categories: { santexnik:1, elektrik:1, umumiy_tamir:1, konditsioner:1, duradgor:1, suvaqchi:1, plitakash:1, svarka:1 }
        };
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
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        current = eased * target;

        if (progress >= 1) {
            current = target;
            el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
            return;
        }
        el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

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
        grid.innerHTML = `<p class="text-center w-100 mt-4" style="color:var(--text-muted);grid-column:1/-1;">${typeof t === 'function' ? t('no_workers_found') : 'Bu toifada ustalar topilmadi.'}</p>`;
        return;
    }
    filtered.forEach((w, i) => {
        const card = createWorkerCard(w);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all .5s var(--ease-out) ${i * 0.06}s`;
        grid.appendChild(card);
        // Trigger reflow then animate
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });
    });
}

function createWorkerCard(worker) {
    const div = document.createElement('div');
    div.className = 'worker-card';
    const catName = CATEGORY_NAMES[worker.category] || worker.category;
    const verifiedTitle = typeof t === 'function' ? t('verified') : 'Tasdiqlangan';
    const verified = worker.is_verified ? `<i class="fa-solid fa-circle-check verified-badge" title="${verifiedTitle}"></i>` : '';
    const avatar = worker.photo_url
        ? `<img src="${worker.photo_url}" alt="${worker.full_name}" class="worker-avatar">`
        : `<div class="worker-avatar"><i class="fa-solid fa-user"></i></div>`;
    
    const starsHtml = generateStarsHtml(worker.avg_rating);
    const yearsText = typeof t === 'function' ? t('worker_years') : 'yil';
    const reviewsText = typeof t === 'function' ? t('worker_reviews') : 'ta izoh';
    const notEntered = typeof t === 'function' ? t('worker_not_entered') : 'Kiritilmagan';
    const agreed = typeof t === 'function' ? t('worker_agreed') : 'Kelishilgan';
    const viewProfile = typeof t === 'function' ? t('worker_view_profile') : "Profilni ko'rish";
    const callText = typeof t === 'function' ? t('worker_call') : 'Chaqirish';
    const noInfo = typeof t === 'function' ? t('worker_no_info') : "Qisqacha ma'lumot kiritilmagan.";

    div.innerHTML = `
        <div class="worker-header">
            ${avatar}
            <div class="worker-info">
                <h3>${worker.full_name} ${verified}</h3>
                <span class="worker-category">${catName}</span>
                <div class="worker-rating">
                    ${starsHtml}
                    <strong>${worker.avg_rating.toFixed(1)}</strong>
                    <span style="color:var(--text-muted)">(${worker.total_reviews} ${reviewsText})</span>
                </div>
            </div>
        </div>
        <div class="worker-body">
            <div class="worker-meta">
                <div><i class="fa-solid fa-briefcase"></i> ${worker.experience_years} ${yearsText}</div>
                <div><i class="fa-solid fa-location-dot"></i> ${worker.city || notEntered}</div>
                <div><i class="fa-solid fa-coins"></i> ${worker.price_range || agreed}</div>
            </div>
            <p class="worker-desc">${worker.description || noInfo}</p>
            <div class="worker-actions">
                <button class="btn btn-outline" onclick="showWorkerProfile(${worker.id})">${viewProfile}</button>
                <a href="tel:${worker.phone}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> ${callText}</a>
            </div>
        </div>`;
    return div;
}

function generateStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += '<i class="fa-solid fa-star" style="color:var(--accent);"></i>';
        } else if (i - rating < 1 && i - rating > 0) {
            html += '<i class="fa-solid fa-star-half-stroke" style="color:var(--accent);"></i>';
        } else {
            html += '<i class="fa-regular fa-star" style="color:var(--border);"></i>';
        }
    }
    return html;
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
            setTimeout(() => {
                filterBtns.forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.filter === cat) b.classList.add('active');
                });
                if (![...filterBtns].find(b => b.dataset.filter === cat)) {
                    filterBtns.forEach(b => { if (b.dataset.filter === 'all') b.classList.add('active'); });
                }
                appState.currentCategory = cat;
                renderWorkers();
            }, 300);
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
    const districtSelect = document.getElementById('districtSelect');
    const suggestionsBox = document.getElementById('searchSuggestions');

    // Autocomplete suggestions
    if (searchInput && suggestionsBox) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query.length < 2) {
                suggestionsBox.classList.remove('active');
                return;
            }

            const suggestions = [];
            // Category suggestions
            for (const [key, name] of Object.entries(CATEGORY_NAMES)) {
                if (name.toLowerCase().includes(query) || key.toLowerCase().includes(query)) {
                    suggestions.push({ type: 'category', key, name, icon: CATEGORY_ICONS[key] || 'fa-wrench' });
                }
            }
            // Worker name suggestions
            appState.workers.forEach(w => {
                if (w.full_name.toLowerCase().includes(query)) {
                    suggestions.push({ type: 'worker', id: w.id, name: w.full_name, category: CATEGORY_NAMES[w.category] || w.category });
                }
            });

            if (suggestions.length === 0) {
                suggestionsBox.classList.remove('active');
                return;
            }

            suggestionsBox.innerHTML = suggestions.slice(0, 6).map(s => {
                if (s.type === 'category') {
                    return `<div class="suggestion-item" data-type="category" data-key="${s.key}">
                        <i class="fa-solid ${s.icon}"></i>
                        <span><strong>${s.name}</strong> — kategoriya</span>
                    </div>`;
                } else {
                    return `<div class="suggestion-item" data-type="worker" data-id="${s.id}">
                        <i class="fa-solid fa-user"></i>
                        <span><strong>${s.name}</strong> — ${s.category}</span>
                    </div>`;
                }
            }).join('');
            suggestionsBox.classList.add('active');

            // Click handlers for suggestions
            suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (item.dataset.type === 'category') {
                        searchInput.value = '';
                        suggestionsBox.classList.remove('active');
                        appState.currentCategory = item.dataset.key;
                        const filterBtns = document.querySelectorAll('.filter-btn');
                        filterBtns.forEach(b => {
                            b.classList.remove('active');
                            if (b.dataset.filter === item.dataset.key) b.classList.add('active');
                        });
                        renderWorkers();
                        document.getElementById('workers').scrollIntoView({ behavior: 'smooth' });
                    } else if (item.dataset.type === 'worker') {
                        searchInput.value = '';
                        suggestionsBox.classList.remove('active');
                        showWorkerProfile(parseInt(item.dataset.id));
                    }
                });
            });
        });

        // Close suggestions on outside click
        document.addEventListener('click', e => {
            if (!e.target.closest('#searchBox')) {
                suggestionsBox.classList.remove('active');
            }
        });
    }

    const doSearch = async () => {
        const query = searchInput.value.toLowerCase();
        const city = citySelect.value;
        const district = districtSelect.value;
        if (suggestionsBox) suggestionsBox.classList.remove('active');

        const grid = document.getElementById('workersGrid');
        const searchingText = typeof t === 'function' ? t('searching') : 'Qidirilmoqda...';
        grid.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>${searchingText}</p></div>`;

        try {
            const params = {};
            if (city) params.city = city;
            if (district) params.district = district;
            if (appState.currentCategory !== 'all') params.category = appState.currentCategory;

            let results = await api.getWorkers(params);
            if (query) {
                results = results.filter(w =>
                    w.full_name.toLowerCase().includes(query) ||
                    w.category.toLowerCase().includes(query) ||
                    (CATEGORY_NAMES[w.category] || '').toLowerCase().includes(query) ||
                    (w.description && w.description.toLowerCase().includes(query))
                );
            }
            renderSearchResults(results);
        } catch (e) {
            let filtered = appState.workers;
            if (query) filtered = filtered.filter(w =>
                w.full_name.toLowerCase().includes(query) ||
                w.category.toLowerCase().includes(query) ||
                (CATEGORY_NAMES[w.category] || '').toLowerCase().includes(query) ||
                (w.description && w.description.toLowerCase().includes(query))
            );
            if (city) filtered = filtered.filter(w => w.city === city);
            if (district) filtered = filtered.filter(w => (w.address && w.address.includes(district)));
            renderSearchResults(filtered);
        }
        document.getElementById('workers').scrollIntoView({ behavior: 'smooth' });
    };

    const renderSearchResults = (results) => {
        const grid = document.getElementById('workersGrid');
        grid.innerHTML = '';
        if (!results.length) {
            const noResultsText = typeof t === 'function' ? t('no_search_results') : "Siz qidirgan mezonlar bo'yicha usta topilmadi.";
            grid.innerHTML = `<p class='text-center w-100 mt-4' style='color:var(--text-muted);grid-column:1/-1;'>${noResultsText}</p>`;
        } else {
            results.forEach((w, i) => {
                const card = createWorkerCard(w);
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = `all .5s var(--ease-out) ${i * 0.06}s`;
                grid.appendChild(card);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                });
            });
        }
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ===== Modals =====
function setupModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const workerModal = document.getElementById('workerModal');
    const registerWorkerBtn = document.getElementById('registerWorkerBtn');
    const registerWorkerModal = document.getElementById('registerWorkerModal');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Password Toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    if(loginBtn) loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');
    if(registerWorkerBtn) registerWorkerBtn.addEventListener('click', () => registerWorkerModal.style.display = 'flex');
    
    closeBtns.forEach(btn => btn.addEventListener('click', function () { this.closest('.modal').style.display = 'none'; }));
    window.addEventListener('click', e => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === workerModal) workerModal.style.display = 'none';
        if (e.target === registerWorkerModal) registerWorkerModal.style.display = 'none';
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if(loginModal) loginModal.style.display = 'none';
            if(workerModal) workerModal.style.display = 'none';
            if(registerWorkerModal) registerWorkerModal.style.display = 'none';
        }
    });

    // Handle register worker form
    const regForm = document.getElementById('registerWorkerForm');
    if(regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = regForm.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuborilmoqda...';
            btn.disabled = true;

            try {
                const formData = new FormData(regForm);
                // HTML chekbokslar faqat "on" qiymat yuboradi
                if (formData.get('consent_fee') === 'on') {
                    formData.set('consent_fee', 'true');
                }
                
                await api.registerWorker(formData);
                showToast(typeof t === 'function' ? t('toast_register_success') : 'Arizangiz muvaffaqiyatli yuborildi!', 'success');
                regForm.reset();
                if(registerWorkerModal) registerWorkerModal.style.display = 'none';
            } catch (err) {
                showToast(err.message || (typeof t === 'function' ? t('toast_error') : 'Xatolik yuz berdi.'), 'error');
            } finally {
                btn.innerHTML = orig;
                btn.disabled = false;
            }
        });
    }

    document.getElementById('loginForm').addEventListener('submit', async e => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btn = e.target.querySelector('button[type="submit"]');
        const orig = btn.textContent;

        try {
            btn.textContent = 'Kirilmoqda...';
            btn.disabled = true;

            // Mock login for Vercel Demo
            if (username === 'Sarvar' && password === 'exa1122211') {
                localStorage.setItem('access_token', 'mock_token_for_demo');
                localStorage.setItem('admin_user', 'Sarvar');
                showToast(typeof t === 'function' ? t('toast_login_success') : 'Muvaffaqiyatli kirdingiz!', 'success');
                loginModal.style.display = 'none';
                setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
                return;
            }

            const result = await api.login(username, password);
            localStorage.setItem('access_token', result.access_token);
            showToast(typeof t === 'function' ? t('toast_login_success') : 'Muvaffaqiyatli kirdingiz!', 'success');
            loginModal.style.display = 'none';
            setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
        } catch (err) {
            showToast(typeof t === 'function' ? t('toast_login_error') : "Login yoki parol noto'g'ri!", 'error');
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

// ===== Worker Profile Modal with Reviews =====
window.showWorkerProfile = async function (id) {
    const worker = appState.workers.find(w => w.id === id);
    if (!worker) return;
    const modal = document.getElementById('workerModal');
    const body = document.getElementById('modalBody');
    const catName = CATEGORY_NAMES[worker.category] || worker.category;
    const starsHtml = generateStarsHtml(worker.avg_rating);
    const tgLink = worker.telegram_username
        ? `<a href="https://t.me/${worker.telegram_username}" target="_blank" class="btn btn-outline w-100 text-center"><i class="fa-brands fa-telegram"></i> Telegram</a>`
        : `<a href="https://t.me/SantexnikUz_bot?start=worker_${worker.id}" target="_blank" class="btn btn-outline w-100 text-center"><i class="fa-brands fa-telegram"></i> Bot orqali</a>`;

    const avatar = worker.photo_url
        ? `<img src="${worker.photo_url}" alt="${worker.full_name}" class="worker-avatar" style="width:100px;height:100px;margin:0 auto 16px;">`
        : `<div class="worker-avatar" style="width:100px;height:100px;font-size:2.5rem;margin:0 auto 16px;"><i class="fa-solid fa-user"></i></div>`;

    body.innerHTML = `
        <div class="text-center" style="margin-bottom:24px">
            ${avatar}
            <h2 style="margin-bottom:6px;font-family:'Outfit',sans-serif;">${worker.full_name}</h2>
            <span class="worker-category" style="font-size:.85rem">${catName}</span>
        </div>
        <div style="background:var(--bg-secondary);padding:22px;border-radius:var(--radius-lg);margin-bottom:24px;border:1px solid var(--border);">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:.95rem">
                <div><strong>Reyting:</strong> ${starsHtml} ${worker.avg_rating.toFixed(1)} (${worker.total_reviews})</div>
                <div><strong>Tajriba:</strong> ${worker.experience_years} yil</div>
                <div><strong>Hudud:</strong> ${worker.city || 'Kiritilmagan'}</div>
                <div><strong>Narx:</strong> ${worker.price_range || 'Kelishilgan'}</div>
            </div>
        </div>
        <h3 style="margin-bottom:10px;font-family:'Outfit',sans-serif;">O'zi haqida</h3>
        <p style="margin-bottom:24px;color:var(--text-secondary);line-height:1.75">${worker.description || "Ma'lumot kiritilmagan"}</p>
        <div style="display:flex;gap:12px;margin-bottom:28px">
            <a href="tel:${worker.phone}" class="btn btn-primary w-100 text-center"><i class="fa-solid fa-phone"></i> Qo'ng'iroq</a>
            ${tgLink}
        </div>

        <!-- Reviews Section -->
        <div style="border-top:1px solid var(--border);padding-top:24px;">
            <h3 style="margin-bottom:16px;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-comments" style="color:var(--primary);"></i> Izohlar
            </h3>
            <div id="reviewsList" class="reviews-list">
                <div class="loading-spinner" style="padding:20px"><div class="spinner"></div><p style="font-size:.85rem;">Izohlar yuklanmoqda...</p></div>
            </div>

            <!-- Review Form -->
            <div style="margin-top:20px;padding:20px;background:var(--bg-secondary);border-radius:var(--radius-lg);border:1px solid var(--border);">
                <h4 style="margin-bottom:14px;font-family:'Outfit',sans-serif;font-size:1rem;">Izoh qoldiring</h4>
                <form id="reviewForm" data-worker-id="${worker.id}">
                    <div class="review-stars" id="reviewStars">
                        <input type="radio" name="rating" value="5" id="star5"><label for="star5"><i class="fa-solid fa-star"></i></label>
                        <input type="radio" name="rating" value="4" id="star4"><label for="star4"><i class="fa-solid fa-star"></i></label>
                        <input type="radio" name="rating" value="3" id="star3"><label for="star3"><i class="fa-solid fa-star"></i></label>
                        <input type="radio" name="rating" value="2" id="star2"><label for="star2"><i class="fa-solid fa-star"></i></label>
                        <input type="radio" name="rating" value="1" id="star1"><label for="star1"><i class="fa-solid fa-star"></i></label>
                    </div>
                    <div class="form-group" style="margin-bottom:12px;">
                        <textarea id="reviewComment" rows="2" placeholder="Izohingizni yozing..." style="width:100%;padding:12px 16px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg);color:var(--text);font-family:inherit;font-size:.9rem;resize:vertical;outline:none;transition:border-color .3s;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">
                        <i class="fa-solid fa-paper-plane"></i> Yuborish
                    </button>
                </form>
            </div>
        </div>`;

    modal.style.display = 'flex';

    // Load reviews
    loadWorkerReviews(worker.id);

    // Setup review form
    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rating = reviewForm.querySelector('input[name="rating"]:checked');
        const comment = document.getElementById('reviewComment').value;

        if (!rating) {
            showToast('Iltimos, reyting tanlang (yulduzlar)', 'error');
            return;
        }

        const btn = reviewForm.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Yuborilmoqda...';
        btn.disabled = true;

        try {
            await api.createReview(worker.id, {
                rating: parseInt(rating.value),
                comment: comment || null
            });
            showToast('Izohingiz muvaffaqiyatli qo\'shildi!', 'success');
            reviewForm.reset();
            loadWorkerReviews(worker.id);
            // Refresh worker data
            fetchWorkers();
        } catch (err) {
            if (err.message.includes('already reviewed')) {
                showToast('Siz allaqachon bu ustaga izoh qoldirgansiz', 'error');
            } else {
                showToast('Izoh qo\'shishda xatolik. Tizimga kiring yoki keyinroq urinib ko\'ring.', 'error');
            }
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
};

async function loadWorkerReviews(workerId) {
    const container = document.getElementById('reviewsList');
    try {
        const reviews = await api.getWorkerReviews(workerId);
        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:.9rem;">Hali izohlar yo\'q. Birinchi bo\'lib izoh qoldiring!</p>';
            return;
        }
        container.innerHTML = reviews.map(r => {
            const starsDisplay = generateStarsHtml(r.rating);
            const date = new Date(r.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' });
            const userName = r.user ? (r.user.full_name || r.user.username) : 'Foydalanuvchi';
            return `
                <div class="review-item">
                    <div class="review-header">
                        <strong><i class="fa-solid fa-user-circle" style="color:var(--primary);margin-right:6px;"></i>${userName}</strong>
                        <span class="review-date">${date}</span>
                    </div>
                    <div class="review-stars-display">${starsDisplay}</div>
                    ${r.comment ? `<p>${r.comment}</p>` : ''}
                </div>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:.9rem;">Izohlarni yuklashda xatolik yuz berdi.</p>';
    }
}

// ===== Toast Notifications =====
function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const close = document.getElementById('mobileMenuClose');
    const open = () => { menu.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const shut = () => { menu.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; };
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
