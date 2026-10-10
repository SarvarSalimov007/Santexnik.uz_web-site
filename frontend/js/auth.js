// ================================================================
// Santexnik.uz — User Authentication System (localStorage Demo)
// ================================================================

const UserAuth = {
    STORAGE_KEY: 'santexnik_user',
    USERS_DB_KEY: 'santexnik_users_db',

    // Get current logged-in user
    getCurrentUser() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // Get all registered users
    _getUsersDb() {
        const data = localStorage.getItem(this.USERS_DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    _saveUsersDb(users) {
        localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(users));
    },

    // Sign up with email and password
    signUp(fullName, email, password) {
        const users = this._getUsersDb();
        
        // Check if email already exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Bu email allaqachon ro\'yxatdan o\'tgan');
        }

        const newUser = {
            id: Date.now(),
            full_name: fullName,
            email: email,
            password: password, // Demo only - never do this in production
            avatar: null,
            provider: 'email',
            created_at: new Date().toISOString(),
            registered_worker_id: null // If this user registered as a worker
        };

        users.push(newUser);
        this._saveUsersDb(users);

        // Auto login
        const sessionUser = { ...newUser };
        delete sessionUser.password;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionUser));
        
        return sessionUser;
    },

    // Login with email and password
    login(email, password) {
        const users = this._getUsersDb();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!user) {
            throw new Error('Email yoki parol noto\'g\'ri');
        }

        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionUser));
        
        return sessionUser;
    },

    // Google sign-in (simulated one-click automatic login for demo)
    googleSignIn() {
        const self = this;
        return new Promise((resolve) => {
            // Remove old mock if exists
            const oldMock = document.getElementById('mockGoogleOAuth');
            if (oldMock) oldMock.remove();

            // Kichik yuklanish oynasini ko'rsatish
            const overlay = document.createElement('div');
            overlay.id = 'mockGoogleOAuth';
            overlay.className = 'mock-google-overlay';
            overlay.innerHTML = `
                <div class="mock-google-card" style="text-align: center; padding: 30px;">
                    <div class="spinner" style="margin: 0 auto 15px; border-top-color: #4285F4; border-left-color: #EA4335; border-bottom-color: #FBBC05; border-right-color: #34A853;"></div>
                    <h3 style="font-family: 'Outfit', sans-serif; color: #333;">Google bilan bog'lanilmoqda...</h3>
                </div>
            `;
            document.body.appendChild(overlay);

            // 1 soniyadan keyin avtomatik login qildirish
            setTimeout(() => {
                const name = "Sarvar Salimov";
                const email = "salimovsarvar518@gmail.com";

                const users = self._getUsersDb();
                let existingUser = users.find(u => u.email === email);
                
                if (!existingUser) {
                    existingUser = {
                        id: Date.now(),
                        full_name: name,
                        email: email,
                        password: null,
                        avatar: null,
                        provider: 'google',
                        created_at: new Date().toISOString(),
                        registered_worker_id: null
                    };
                    users.push(existingUser);
                    self._saveUsersDb(users);
                }

                const sessionUser = { ...existingUser };
                delete sessionUser.password;
                localStorage.setItem(self.STORAGE_KEY, JSON.stringify(sessionUser));
                
                overlay.remove();
                resolve(sessionUser);
            }, 1000);
        });
    },

    // Logout
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    // Link user to a registered worker
    linkToWorker(workerId) {
        const user = this.getCurrentUser();
        if (user) {
            user.registered_worker_id = workerId;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
            // Also update in users DB
            const users = this._getUsersDb();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx > -1) {
                users[idx].registered_worker_id = workerId;
                this._saveUsersDb(users);
            }
        }
    },

    // Check if user is the worker (prevent self-review)
    isCurrentUserWorker(workerId) {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.registered_worker_id === workerId;
    },

    // Get user initials for avatar
    getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
    }
};

// ================================================================
// Auth UI Controller
// ================================================================

function initAuthUI() {
    const user = UserAuth.getCurrentUser();
    updateNavbarForAuth(user);
}

function updateNavbarForAuth(user) {
    // Desktop nav actions
    const navActions = document.querySelector('.nav-actions');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Remove existing user profile elements
    document.querySelectorAll('.user-profile-btn, .user-profile-mobile').forEach(el => el.remove());

    if (user) {
        // === LOGGED IN STATE ===
        const initials = UserAuth.getInitials(user.full_name);
        
        // Desktop: Add profile button before "Admin Panel" button
        const profileBtn = document.createElement('div');
        profileBtn.className = 'user-profile-btn';
        profileBtn.innerHTML = `
            <div class="user-avatar-small" title="${user.full_name}">${initials}</div>
            <div class="user-dropdown" id="userDropdown">
                <div class="user-dropdown-header">
                    <div class="user-avatar-large">${initials}</div>
                    <div>
                        <strong>${user.full_name}</strong>
                        <small>${user.email}</small>
                    </div>
                </div>
                <div class="user-dropdown-divider"></div>
                <div class="user-dropdown-item" id="userLogoutBtn">
                    <i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="auth_logout">Chiqish</span>
                </div>
            </div>
        `;
        
        // Insert before loginBtn
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && navActions) {
            navActions.insertBefore(profileBtn, loginBtn);
        }

        // Click to toggle dropdown
        const avatarBtn = profileBtn.querySelector('.user-avatar-small');
        const dropdown = profileBtn.querySelector('.user-dropdown');
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => dropdown.classList.remove('open'));

        // Logout
        document.getElementById('userLogoutBtn').addEventListener('click', () => {
            UserAuth.logout();
            showToast('Hisobdan chiqdingiz', 'success');
            updateNavbarForAuth(null);
        });

        // Mobile: Add profile section
        const mobileProfileSection = document.createElement('div');
        mobileProfileSection.className = 'user-profile-mobile';
        mobileProfileSection.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:1px solid var(--border);margin-bottom:10px;">
                <div class="user-avatar-large">${initials}</div>
                <div>
                    <strong style="color:var(--text);display:block;">${user.full_name}</strong>
                    <small style="color:var(--text-muted);">${user.email}</small>
                </div>
            </div>
            <button id="mobileUserLogoutBtn" class="btn btn-outline btn-sm" style="width:100%;margin-bottom:10px;">
                <i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="auth_logout">Hisobdan chiqish</span>
            </button>
        `;
        
        // Remove existing sign in button from mobile
        const mobileSignInBtn = document.getElementById('mobileSignInBtn');
        if (mobileSignInBtn) mobileSignInBtn.remove();
        
        // Add to mobile menu at the top of button area
        const mobileButtonArea = mobileMenu?.querySelector('div[style*="padding: 16px"]');
        if (mobileButtonArea) {
            mobileButtonArea.insertBefore(mobileProfileSection, mobileButtonArea.firstChild);
        }

        setTimeout(() => {
            const mobileLogoutBtn = document.getElementById('mobileUserLogoutBtn');
            if (mobileLogoutBtn) {
                mobileLogoutBtn.addEventListener('click', () => {
                    UserAuth.logout();
                    showToast('Hisobdan chiqdingiz', 'success');
                    updateNavbarForAuth(null);
                });
            }
        }, 50);

        // Hide "Sign In" desktop button if we added one
        const signInNavBtn = document.getElementById('userSignInNavBtn');
        if (signInNavBtn) signInNavBtn.remove();

    } else {
        // === LOGGED OUT STATE ===
        // Desktop: Add sign-in button 
        const signInBtn = document.createElement('button');
        signInBtn.id = 'userSignInNavBtn';
        signInBtn.className = 'btn btn-outline btn-sm user-profile-btn';
        signInBtn.innerHTML = '<i class="fa-solid fa-user"></i> <span data-i18n="nav_login_user">Kirish</span>';
        signInBtn.addEventListener('click', () => openAuthModal());
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && navActions) {
            navActions.insertBefore(signInBtn, loginBtn);
        }

        // Mobile: Add sign-in button
        const mobileSignIn = document.createElement('button');
        mobileSignIn.id = 'mobileSignInBtn';
        mobileSignIn.className = 'btn btn-primary btn-sm';
        mobileSignIn.style = 'width:100%;margin-bottom:10px;';
        mobileSignIn.innerHTML = '<i class="fa-solid fa-user"></i> <span data-i18n="nav_login_user">Kirish</span>';
        mobileSignIn.addEventListener('click', () => {
            openAuthModal();
            document.getElementById('mobileMenu')?.classList.remove('open');
            document.getElementById('mobileOverlay')?.classList.remove('open');
            document.body.style.overflow = '';
        });

        const mobileButtonArea = mobileMenu?.querySelector('div[style*="padding: 16px"]');
        if (mobileButtonArea) {
            mobileButtonArea.insertBefore(mobileSignIn, mobileButtonArea.firstChild);
        }
    }
    
    // Make sure we apply translations to newly added elements
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

function openAuthModal(mode = 'login') {
    let modal = document.getElementById('userAuthModal');
    if (!modal) {
        modal = createAuthModal();
        document.body.appendChild(modal);
        setupAuthModalEvents(modal);
    }
    
    // Switch to correct tab
    switchAuthTab(mode);
    modal.style.display = 'flex';
    
    if (typeof applyTranslations === 'function') {
        applyTranslations(modal);
    }
}

function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'userAuthModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content auth-modal" style="max-width:440px;">
            <span class="close-modal" id="authModalClose">&times;</span>
            
            <!-- Auth Tabs -->
            <div class="auth-tabs">
                <button class="auth-tab active" data-auth-tab="login" data-i18n="auth_login_tab">Kirish</button>
                <button class="auth-tab" data-auth-tab="signup" data-i18n="auth_signup_tab">Ro'yxatdan o'tish</button>
            </div>

            <!-- Login Form -->
            <div id="authLoginPanel" class="auth-panel active">
                <form id="userLoginForm">
                    <div class="form-group">
                        <label for="userLoginEmail" data-i18n="auth_email_label">Email</label>
                        <input type="email" id="userLoginEmail" placeholder="email@gmail.com" required>
                    </div>
                    <div class="form-group">
                        <label for="userLoginPassword" data-i18n="auth_pass_label">Parol</label>
                        <div class="password-wrapper" style="position:relative;">
                            <input type="password" id="userLoginPassword" required style="padding-right:45px;">
                            <i class="fa-solid fa-eye-slash toggle-password" id="toggleLoginPass" style="position:absolute;right:15px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-muted);"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary w-100" style="padding:14px;">
                        <i class="fa-solid fa-right-to-bracket"></i> <span data-i18n="auth_login_btn">Kirish</span>
                    </button>
                </form>
                <div class="auth-divider">
                    <span data-i18n="auth_or">yoki</span>
                </div>
                <button id="googleLoginBtn" class="btn-google">
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    <span data-i18n="auth_google_login">Google bilan kirish</span>
                </button>
                <p class="auth-switch-text">
                    <span data-i18n="auth_no_account">Hisobingiz yo'qmi?</span> <a href="#" id="switchToSignup" data-i18n="auth_signup_tab">Ro'yxatdan o'ting</a>
                </p>
            </div>

            <!-- Signup Form -->
            <div id="authSignupPanel" class="auth-panel">
                <form id="userSignupForm">
                    <div class="form-group">
                        <label for="userSignupName" data-i18n="auth_name_label">To'liq ismingiz</label>
                        <input type="text" id="userSignupName" required>
                    </div>
                    <div class="form-group">
                        <label for="userSignupEmail" data-i18n="auth_email_label">Email</label>
                        <input type="email" id="userSignupEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="userSignupPassword" data-i18n="auth_pass_label">Parol</label>
                        <div class="password-wrapper" style="position:relative;">
                            <input type="password" id="userSignupPassword" required minlength="6" style="padding-right:45px;">
                            <i class="fa-solid fa-eye-slash toggle-password" id="toggleSignupPass" style="position:absolute;right:15px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-muted);"></i>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary w-100" style="padding:14px;background:var(--success);box-shadow:0 4px 14px rgba(16,185,129,0.3);">
                        <i class="fa-solid fa-user-plus"></i> <span data-i18n="auth_signup_btn">Ro'yxatdan o'tish</span>
                    </button>
                </form>
                <div class="auth-divider">
                    <span data-i18n="auth_or">yoki</span>
                </div>
                <button id="googleSignupBtn" class="btn-google">
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    <span data-i18n="auth_google_signup">Google bilan ro'yxatdan o'tish</span>
                </button>
                <p class="auth-switch-text">
                    <span data-i18n="auth_has_account">Hisobingiz bormi?</span> <a href="#" id="switchToLogin" data-i18n="auth_login_tab">Kirish</a>
                </p>
            </div>
        </div>
    `;
    return modal;
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.authTab === tab);
    });
    document.getElementById('authLoginPanel')?.classList.toggle('active', tab === 'login');
    document.getElementById('authSignupPanel')?.classList.toggle('active', tab === 'signup');
}

function setupAuthModalEvents(modal) {
    // Close
    modal.querySelector('#authModalClose').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Tab switching
    modal.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.authTab));
    });
    modal.querySelector('#switchToSignup')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('signup'); });
    modal.querySelector('#switchToLogin')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthTab('login'); });

    // Password toggles
    const setupToggle = (toggleId, inputId) => {
        const toggle = modal.querySelector('#' + toggleId);
        const input = modal.querySelector('#' + inputId);
        if (toggle && input) {
            toggle.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                toggle.classList.toggle('fa-eye');
                toggle.classList.toggle('fa-eye-slash');
            });
        }
    };
    setupToggle('toggleLoginPass', 'userLoginPassword');
    setupToggle('toggleSignupPass', 'userSignupPassword');

    // Login form
    modal.querySelector('#userLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('userLoginEmail').value;
        const password = document.getElementById('userLoginPassword').value;
        try {
            const user = UserAuth.login(email, password);
            showToast(`Xush kelibsiz, ${user.full_name}!`, 'success');
            modal.style.display = 'none';
            updateNavbarForAuth(user);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Signup form
    modal.querySelector('#userSignupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('userSignupName').value;
        const email = document.getElementById('userSignupEmail').value;
        const password = document.getElementById('userSignupPassword').value;
        try {
            const user = UserAuth.signUp(name, email, password);
            showToast(`Muvaffaqiyatli ro'yxatdan o'tdingiz, ${user.full_name}!`, 'success');
            modal.style.display = 'none';
            updateNavbarForAuth(user);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Google buttons
    const handleGoogle = async () => {
        try {
            const user = await UserAuth.googleSignIn();
            showToast(`Google orqali kirdingiz: ${user.full_name}`, 'success');
            modal.style.display = 'none';
            updateNavbarForAuth(user);
        } catch (err) {
            if (err.message !== 'Bekor qilindi') {
                showToast(err.message, 'error');
            }
        }
    };
    modal.querySelector('#googleLoginBtn')?.addEventListener('click', handleGoogle);
    modal.querySelector('#googleSignupBtn')?.addEventListener('click', handleGoogle);
}

// ================================================================
// Auth Guard — requires login before action
// ================================================================
function requireAuth(actionCallback, message) {
    if (UserAuth.isLoggedIn()) {
        actionCallback();
    } else {
        showToast(message || 'Iltimos, avval hisobingizga kiring', 'warning');
        openAuthModal('login');
    }
}
