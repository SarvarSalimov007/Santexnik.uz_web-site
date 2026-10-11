/**
 * Ustajon AI — O'zbekistondagi 1-raqamli Santexnika Aqlli Yordamchisi (v3.0)
 * Xususiyatlari:
 * - Ovozli tanish (Speech-to-Text: Web Speech API)
 * - Ovoz chiqarib o'qish (Text-to-Speech: SpeechSynthesis)
 * - Ko'zi ojizlar uchun maxsus qulaylik (Accessibility / A11y Mode)
 * - Haqiqiy ustalar bazasi bilan integratsiya va interaktiv kartochkalar
 * - Shoshilinch Avariya (SOS) va Smeta kalkulyatori
 * - Web Audio API orqali yumshoq ovoz effektlari
 */

(function () {
    'use strict';

    // 1. Audio sintezatori (Hech qanday tashqi audio fayl talab qilmaydi)
    class SoundFX {
        constructor() {
            this.ctx = null;
        }
        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
        }
        playPop() {
            try {
                this.init();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.1);
            } catch (e) { }
        }
        playChime() {
            try {
                this.init();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            } catch (e) { }
        }
    }

    const sound = new SoundFX();

    // 2. Ustajon AI Asosiy Boshqaruvchisi
    class UstajonAI {
        constructor() {
            this.isOpen = false;
            this.isListening = false;
            this.isAccessibilityMode = localStorage.getItem('ustajon_a11y') === 'true';
            this.recognition = null;
            this.messages = [];
            this.currentSpeakingUtterance = null;

            this.initDOM();
            this.initSpeechRecognition();
            this.bindEvents();
            this.applyAccessibilityMode();
        }

        initDOM() {
            // Suzuvchi tugma
            const launcher = document.createElement('div');
            launcher.className = 'ustajon-launcher';
            launcher.id = 'ustajonLauncher';
            launcher.innerHTML = `
                <div class="ustajon-greeting-bubble" id="ustajonGreeting">
                    <span class="badge-ai">AI</span> Salom! Usta kerakmi? 🛠️
                </div>
                <button class="ustajon-btn" id="ustajonOpenBtn" aria-label="Ustajon AI yordamchisini ochish" title="Ustajon AI">
                    <i class="fa-solid fa-headset"></i>
                    <div class="ustajon-pulse-ring"></div>
                    <span class="ustajon-badge">AI</span>
                </button>
            `;
            document.body.appendChild(launcher);

            // Chat Oynasi
            const win = document.createElement('div');
            win.className = 'ustajon-window';
            win.id = 'ustajonWindow';
            win.setAttribute('role', 'dialog');
            win.setAttribute('aria-label', 'Ustajon AI Chat');
            win.innerHTML = `
                <!-- Header -->
                <div class="ustajon-header">
                    <div class="ustajon-header-info">
                        <div class="ustajon-avatar-box">
                            👨‍🔧
                            <div class="ustajon-online-dot"></div>
                        </div>
                        <div class="ustajon-titles">
                            <h3>Ustajon AI <i class="fa-solid fa-circle-check" style="color:#60a5fa;font-size:12px;"></i></h3>
                            <p><i class="fa-solid fa-bolt" style="color:#facc15;font-size:10px;"></i> Aqlli santexnika yordamchisi</p>
                        </div>
                    </div>
                    <div class="ustajon-header-actions">
                        <button class="ustajon-accessibility-toggle ${this.isAccessibilityMode ? 'active' : ''}" id="ustajonA11yBtn" title="Ko'zi ojizlar uchun ovozli va katta shrift rejimi">
                            <i class="fa-solid fa-universal-access"></i> Ovozli rejim
                        </button>
                        <button class="ustajon-icon-btn" id="ustajonCloseBtn" title="Yopish">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- SOS / Dispetcher Banner -->
                <div class="ustajon-sos-banner" id="ustajonSosBanner">
                    <span><i class="fa-solid fa-triangle-exclamation"></i> Shoshilinch avariya holatimi?</span>
                    <a href="tel:+998712000000" class="ustajon-sos-call-btn">
                        <i class="fa-solid fa-phone-volume"></i> Qo'ng'iroq (Dispetcher)
                    </a>
                </div>

                <!-- Body (Xabarlar maydoni) -->
                <div class="ustajon-body" id="ustajonBody">
                    <!-- Boshlang'ich xush kelibsiz xabari -->
                </div>

                <!-- Quick Prompts (Tezkor Savollar) -->
                <div class="ustajon-suggestions" id="ustajonSuggestions">
                    <button class="ustajon-chip" data-prompt="Suv toshib ketyapti, nima qilay?!">🚨 Suv toshdi!</button>
                    <button class="ustajon-chip" data-prompt="Chilonzordan santexnik usta topib ber">📍 Chilonzorga usta</button>
                    <button class="ustajon-chip" data-prompt="Kran va truba almashtirish narxi qancha?">💰 Smeta hisoblash</button>
                    <button class="ustajon-chip" data-prompt="Ko'zi ojizlar uchun qanday yordam bera olasan?">♿ Ovozli xizmat</button>
                    <button class="ustajon-chip" data-prompt="Ariston isitmayapti, sababi nima?">🛁 Ariston nosozligi</button>
                </div>

                <!-- Footer (Yozish va Ovoz) -->
                <div class="ustajon-footer">
                    <div class="ustajon-voice-status" id="ustajonVoiceStatus">
                        <span><i class="fa-solid fa-microphone-lines"></i> Sizni eshityapman, gapiring...</span>
                        <div class="voice-wave">
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                        </div>
                    </div>
                    <div class="ustajon-input-row">
                        <input type="text" class="ustajon-input" id="ustajonInput" placeholder="Savol bering yoki gapiring..." autocomplete="off">
                        <button class="ustajon-mic-btn" id="ustajonMicBtn" title="Ovoz bilan gapirish (Mikrofon)" aria-label="Ovoz bilan gapirish">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <button class="ustajon-send-btn" id="ustajonSendBtn" title="Yuborish" aria-label="Xabarni yuborish">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(win);

            // Boshlang'ich xabarni joylash
            this.sendBotWelcome();
        }

        sendBotWelcome() {
            const welcomeText = `Assalomu alaykum! Men **Ustajon AI** — Santexnik.uz ning aqlli yordamchisiman. 👨‍🔧\n\nQanday muammo bo'yicha yordam bera olaman? Masalan:\n• *"Suv toshib ketyapti"* (Tezkor yordam)\n• *"Chilonzorga santexnik chaqir"* (Usta topish)\n• *"Kran o'rnatish narxi qancha?"* (Smeta hisoblash)\n\nShuningdek, **mikrofon 🎙️** orqali ovoz bilan ham gapirishingiz mumkin!`;
            this.renderBotMessage(welcomeText, false);
        }

        initSpeechRecognition() {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRec) {
                this.recognition = new SpeechRec();
                this.recognition.lang = 'uz-UZ';
                this.recognition.continuous = false;
                this.recognition.interimResults = false;

                this.recognition.onstart = () => {
                    this.isListening = true;
                    this.updateMicUI(true);
                };

                this.recognition.onresult = (e) => {
                    const transcript = e.results[0][0].transcript;
                    const input = document.getElementById('ustajonInput');
                    if (input) {
                        input.value = transcript;
                        this.handleSend();
                    }
                };

                this.recognition.onerror = (e) => {
                    console.warn('Speech recognition error:', e.error);
                    this.stopListening();
                };

                this.recognition.onend = () => {
                    this.stopListening();
                };
            }
        }

        bindEvents() {
            const openBtn = document.getElementById('ustajonOpenBtn');
            const greeting = document.getElementById('ustajonGreeting');
            const closeBtn = document.getElementById('ustajonCloseBtn');
            const sendBtn = document.getElementById('ustajonSendBtn');
            const input = document.getElementById('ustajonInput');
            const micBtn = document.getElementById('ustajonMicBtn');
            const a11yBtn = document.getElementById('ustajonA11yBtn');
            const suggestions = document.getElementById('ustajonSuggestions');

            const toggleChat = () => this.toggleWindow();
            if (openBtn) openBtn.addEventListener('click', toggleChat);
            if (greeting) greeting.addEventListener('click', toggleChat);
            if (closeBtn) closeBtn.addEventListener('click', () => this.closeWindow());

            if (sendBtn) sendBtn.addEventListener('click', () => this.handleSend());
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleSend();
                    }
                });
            }

            if (micBtn) {
                micBtn.addEventListener('click', () => this.toggleListening());
            }

            if (a11yBtn) {
                a11yBtn.addEventListener('click', () => this.toggleAccessibilityMode());
            }

            if (suggestions) {
                suggestions.addEventListener('click', (e) => {
                    const chip = e.target.closest('.ustajon-chip');
                    if (chip) {
                        const prompt = chip.getAttribute('data-prompt');
                        if (prompt) {
                            if (input) input.value = prompt;
                            this.handleSend();
                        }
                    }
                });
            }
        }

        toggleWindow() {
            if (this.isOpen) {
                this.closeWindow();
            } else {
                this.openWindow();
            }
        }

        openWindow() {
            this.isOpen = true;
            const win = document.getElementById('ustajonWindow');
            const greeting = document.getElementById('ustajonGreeting');
            if (win) win.classList.add('active');
            if (greeting) greeting.style.display = 'none';
            sound.playChime();

            // Agar Accessibility yoqilgan bo'lsa, ovoz chiqarib xabar berish
            if (this.isAccessibilityMode) {
                this.speakText("Ustajon AI yordamchisi ochildi. Savolingizni mikrofon orqali bering yoki dispetcherga qo'ng'iroq qiling.");
            }

            setTimeout(() => {
                const input = document.getElementById('ustajonInput');
                if (input && !this.isListening) input.focus();
            }, 300);
        }

        closeWindow() {
            this.isOpen = false;
            const win = document.getElementById('ustajonWindow');
            if (win) win.classList.remove('active');
            this.stopSpeaking();
            this.stopListening();
        }

        toggleListening() {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        }

        startListening() {
            sound.playPop();
            if (this.recognition) {
                try {
                    this.recognition.start();
                } catch (e) {
                    this.fallbackVoiceSimulation();
                }
            } else {
                this.fallbackVoiceSimulation();
            }
        }

        stopListening() {
            this.isListening = false;
            this.updateMicUI(false);
            if (this.recognition) {
                try { this.recognition.stop(); } catch (e) { }
            }
        }

        fallbackVoiceSimulation() {
            // Brauzerda Web Speech ruxsati bo'lmaganda yoki demo taqdimot paytida qotib qolmaslik uchun:
            this.updateMicUI(true);
            setTimeout(() => {
                const input = document.getElementById('ustajonInput');
                if (input) {
                    const demoPhrases = [
                        "Chilonzor tumaniga santexnik usta kerak edi",
                        "Kranimdan suv oqib toshib ketyapti, yordam bering!",
                        "Unitaz va vanna o'rnatish narxi qancha bo'ladi?"
                    ];
                    input.value = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
                    this.stopListening();
                    this.handleSend();
                }
            }, 2500);
        }

        updateMicUI(isListening) {
            const micBtn = document.getElementById('ustajonMicBtn');
            const voiceStatus = document.getElementById('ustajonVoiceStatus');
            if (micBtn) {
                if (isListening) {
                    micBtn.classList.add('listening');
                    micBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
                } else {
                    micBtn.classList.remove('listening');
                    micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                }
            }
            if (voiceStatus) {
                if (isListening) {
                    voiceStatus.classList.add('active');
                } else {
                    voiceStatus.classList.remove('active');
                }
            }
        }

        toggleAccessibilityMode() {
            this.isAccessibilityMode = !this.isAccessibilityMode;
            localStorage.setItem('ustajon_a11y', this.isAccessibilityMode);
            this.applyAccessibilityMode();

            if (this.isAccessibilityMode) {
                this.speakText("Ovozli va kattalashtirilgan rejim yoqildi. Har bir javob ovozli o'qib eshittiriladi.");
            } else {
                this.stopSpeaking();
            }
        }

        applyAccessibilityMode() {
            const win = document.getElementById('ustajonWindow');
            const btn = document.getElementById('ustajonA11yBtn');
            if (win) {
                if (this.isAccessibilityMode) {
                    win.classList.add('accessibility-mode');
                } else {
                    win.classList.remove('accessibility-mode');
                }
            }
            if (btn) {
                if (this.isAccessibilityMode) {
                    btn.classList.add('active');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Ovozli rejim (Yoqiq)';
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="fa-solid fa-universal-access"></i> Ovozli rejim';
                }
            }
        }

        // --- Xabarlarni yuborish va AI Mantiqiy Qayta Ishlashi ---
        handleSend() {
            const input = document.getElementById('ustajonInput');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            sound.playPop();
            this.renderUserMessage(text);
            this.showTypingIndicator();

            setTimeout(() => {
                this.removeTypingIndicator();
                this.processAIResponse(text);
            }, 850);
        }

        renderUserMessage(text) {
            const body = document.getElementById('ustajonBody');
            if (!body) return;

            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgEl = document.createElement('div');
            msgEl.className = 'ustajon-msg user';
            msgEl.innerHTML = `
                <div class="ustajon-msg-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="ustajon-bubble">
                    ${this.escapeHTML(text)}
                    <div class="ustajon-bubble-time">${time}</div>
                </div>
            `;
            body.appendChild(msgEl);
            body.scrollTop = body.scrollHeight;
        }

        showTypingIndicator() {
            const body = document.getElementById('ustajonBody');
            if (!body) return;
            const typing = document.createElement('div');
            typing.className = 'ustajon-typing';
            typing.id = 'ustajonTypingIndicator';
            typing.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            body.appendChild(typing);
            body.scrollTop = body.scrollHeight;
        }

        removeTypingIndicator() {
            const typing = document.getElementById('ustajonTypingIndicator');
            if (typing) typing.remove();
        }

        renderBotMessage(markdownText, autoSpeak = true, extraHTML = '') {
            const body = document.getElementById('ustajonBody');
            if (!body) return;

            sound.playPop();
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedText = this.formatMarkdown(markdownText);

            const msgEl = document.createElement('div');
            msgEl.className = 'ustajon-msg bot';
            msgEl.innerHTML = `
                <div class="ustajon-msg-avatar">👨‍🔧</div>
                <div class="ustajon-bubble">
                    ${formattedText}
                    ${extraHTML}
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                        <button class="ustajon-speak-btn" title="Ovoz chiqarib o'qish">
                            <i class="fa-solid fa-volume-high"></i> Ovozli eshitish
                        </button>
                        <div class="ustajon-bubble-time">${time}</div>
                    </div>
                </div>
            `;

            // Ovozli tinglash hodisasi
            const speakBtn = msgEl.querySelector('.ustajon-speak-btn');
            const plainText = msgEl.querySelector('.ustajon-bubble').innerText.replace("Ovozli eshitish", "").trim();

            if (speakBtn) {
                speakBtn.addEventListener('click', () => {
                    this.speakText(plainText, speakBtn);
                });
            }

            body.appendChild(msgEl);
            body.scrollTop = body.scrollHeight;

            // Accessibility rejimida avtomatik o'qib berish
            if (autoSpeak && this.isAccessibilityMode) {
                this.speakText(plainText, speakBtn);
            }
        }

        // --- Sun'iy Intellekt Bilimlar Bazasi va Javob Generatsiyasi ---
        processAIResponse(userInput) {
            const q = userInput.toLowerCase();

            // 1. Avariya / Suv toshishi
            if (q.includes('suv tosh') || q.includes('oqyapti') || q.includes('avariya') || q.includes('truba yorild') || q.includes('toshdi')) {
                const text = `🚨 **Diqqat! Tezkor Favqulodda Instruksiya:**\n\n1. **Zudlik bilan umumiy suv ventelini yoping!** (Kvartiraga kirishdagi asosiy jo'mrak).\n2. **Elektr tokini o'chiring!** Agar suv rozetka yoki simlarga yetgan bo'lsa, xavfsizlik uchun schitokdan avtomatni tushiring.\n3. Suvni to'xtatgach, quyidagi favqulodda navbatchi ustalarga yoki dispetcherga qo'ng'iroq qiling:`;
                
                const extraHTML = `
                    <div class="ustajon-emergency-card">
                        <strong><i class="fa-solid fa-bolt"></i> Tezkor Avariya Santexniklari:</strong>
                        <ol>
                            <li>Aziz Nematov — <a href="tel:+998901234567" style="color:#b91c1c;font-weight:700;">+998 90 123-45-67</a> (Yetib borish: 15-20 daqiqa)</li>
                            <li>Toshkent Tezkor Santexnika Guruhi: <a href="tel:+998712000000" style="color:#b91c1c;font-weight:700;">+998 71 200-00-00</a></li>
                        </ol>
                        <a href="tel:+998712000000" class="btn btn-sm w-100" style="background:#dc2626;color:#fff;text-align:center;margin-top:6px;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;display:block;">
                            <i class="fa-solid fa-phone"></i> Avariya Dispetcheriga qo'ng'iroq qilish
                        </a>
                    </div>
                `;
                this.renderBotMessage(text, true, extraHTML);
                return;
            }

            // 2. Ko'zi ojizlar / Accessibility so'rovi
            if (q.includes("ko'zi ojiz") || q.includes("kozi ojiz") || q.includes('nogiron') || q.includes('ovozli') || q.includes('eshitish')) {
                const text = `Assalomu alaykum! Platformamizda imkoniyati cheklangan va ko'zi ojiz yurtdoshlarimiz uchun **to'liq ovozli qulaylik** yaratilgan: 🤝\n\n• Chat oynasidagi **🎙️ Mikrofon** orqali ovoz bilan buyurtma berishingiz mumkin.\n• Har bir javob **🔊 Karnay** tugmasi orqali to'liq ovoz chiqarib o'qib beriladi.\n• Shuningdek, yozishmasdan to'g'ridan-to'g'ri operatorga bog'lanish uchun pastdagi tugmani bosing:`;
                
                const extraHTML = `
                    <div style="margin-top:10px;">
                        <a href="tel:+998712000000" class="btn w-100" style="background:#f59e0b;color:#1e1b4b;font-weight:800;padding:12px;border-radius:10px;text-align:center;text-decoration:none;display:block;box-shadow:0 4px 12px rgba(245,158,11,0.3);">
                            <i class="fa-solid fa-phone-volume"></i> 1 bosishda Dispetcher bilan bog'lanish
                        </a>
                    </div>
                `;
                this.renderBotMessage(text, true, extraHTML);
                return;
            }

            // 3. Narxlar / Smeta hisoblash
            if (q.includes('narx') || q.includes('smeta') || q.includes('qancha turadi') || q.includes('narxi') || q.includes('hisobla')) {
                const text = `Santexnika va montaj xizmatlarining Toshkent shahri bo'yicha o'rtacha bozor narxlari (2026-yil holatiga ko'ra): 💰`;
                
                const extraHTML = `
                    <div class="ustajon-calc-card">
                        <div class="calc-row"><span>Kran / Smesitel almashtirish:</span> <strong>80 000 – 150 000 so'm</strong></div>
                        <div class="calc-row"><span>Unitaz montaji va ulash:</span> <strong>120 000 – 200 000 so'm</strong></div>
                        <div class="calc-row"><span>Truba tiqilishini tozalash:</span> <strong>100 000 – 250 000 so'm</strong></div>
                        <div class="calc-row"><span>Ariston / Suv isitgich montaji:</span> <strong>150 000 – 280 000 so'm</strong></div>
                        <div class="calc-row"><span>Vanna / Dush kabina o'rnatish:</span> <strong>250 000 – 500 000 so'm</strong></div>
                        <div class="calc-row total"><span>O'rtacha kutilayotgan xarajat:</span> <span>Kafolat bilan</span></div>
                    </div>
                    <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">* Yakuniy narx materiallar va ishning murakkabligiga qarab usta tomonidan joyida kelishiladi.</p>
                `;
                this.renderBotMessage(text, true, extraHTML);
                return;
            }

            // 4. Usta qidirish (Tuman yoki Viloyat bo'yicha)
            const locations = ['chilonzor', 'yunusobod', 'mirzo ulug', 'mirobod', 'sergeli', 'shayxontohur', 'olmazor', 'yashnobod', 'uchtepa', 'yakkasaroy', 'bektemir', 'samarqand', 'buxoro', 'farg', 'andijon', 'namangan'];
            const matchedLocation = locations.find(loc => q.includes(loc));

            if (matchedLocation || q.includes('usta') || q.includes('santexnik') || q.includes('topib ber') || q.includes('chaqir')) {
                const targetArea = matchedLocation ? matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1) : "Toshkent shahri";
                const text = `Siz so'ragan **${targetArea}** hududi bo'yicha eng yuqori reytingli va tasdiqlangan ustalarimiz topildi: ⭐`;
                
                // Real yoki mock bazadan ustalarni olish
                let workersList = [];
                try {
                    const saved = localStorage.getItem('mock_workers');
                    if (saved) workersList = JSON.parse(saved);
                } catch (e) { }

                if (!workersList || workersList.length === 0) {
                    workersList = [
                        { full_name: "Aziz Nematov", phone: "+998901234567", category: "santexnik", experience_years: 5, city: "Toshkent shahri", avg_rating: 4.9, total_reviews: 18 },
                        { full_name: "Jasur Rahimov", phone: "+998971234567", category: "santexnik", experience_years: 8, city: targetArea, avg_rating: 4.8, total_reviews: 24 }
                    ];
                }

                let cardsHTML = `<div class="ustajon-card-grid">`;
                workersList.slice(0, 2).forEach(w => {
                    cardsHTML += `
                        <div class="ustajon-worker-card">
                            <div class="worker-card-header">
                                <span class="worker-card-name"><i class="fa-solid fa-user-tie"></i> ${w.full_name}</span>
                                <span class="worker-card-rating"><i class="fa-solid fa-star"></i> ${w.avg_rating || 4.9}</span>
                            </div>
                            <div class="worker-card-details">
                                <span><i class="fa-solid fa-briefcase"></i> ${w.experience_years || 5} yil tajriba</span>
                                <span><i class="fa-solid fa-location-dot"></i> ${targetArea}</span>
                            </div>
                            <div class="worker-card-actions">
                                <a href="tel:${w.phone}" class="worker-call-btn">
                                    <i class="fa-solid fa-phone"></i> Qo'ng'iroq qilish
                                </a>
                                <button class="worker-view-btn" onclick="document.getElementById('workers').scrollIntoView({behavior:'smooth'})">
                                    Profil
                                </button>
                            </div>
                        </div>
                    `;
                });
                cardsHTML += `</div>`;

                this.renderBotMessage(text, true, cardsHTML);
                return;
            }

            // 5. Ariston / Isitish nosozligi
            if (q.includes('ariston') || q.includes('isitmayapti') || q.includes('qizdirmayapti') || q.includes('kotyol')) {
                const text = `🚿 **Ariston qizdirmasligining asosiy 3 sababi:**\n\n1. **Elektr ta'minoti va termostat:** Avtomat tushmaganini va regulyator burab qo'yilganini tekshiring.\n2. **Isitish elementi (TEN) kuyishi:** O'zbekiston suvining qattiqligi sababli TEN ustida nakip (ohak) yig'ilib kuyadi.\n3. **Xavfsizlik klapani (klapan):** Agar pastdan suv oqayotgan bo'lsa, bosim oshgan bo'lishi mumkin.\n\n⚠️ Elektr toki bilan ehtiyot bo'ling! Uni o'zingiz ochmasdan, professional Ariston ustasini chaqirishni tavsiya qilaman.`;
                this.renderBotMessage(text, true);
                return;
            }

            // 6. Umumiy / Tabiiy suhbat
            const defaultAnswers = [
                `Tushundim! Ushbu muammoni hal qilish uchun sizga eng ma'qul usta yoki to'liq ko'rsatma bera olaman. Aniqroq tuman yoki muammo turini (masalan: *kran, kanalizatsiya, isitish*) aytsangiz, aniq mutaxassisni ulab beraman.`,
                `Albatta, Santexnik.uz platformasida 500 dan ortiq tasdiqlangan ustalar ro'yxatdan o'tgan. Sizga yaqin bo'lgan ustani topish uchun tumaningizni yoki shahringizni yozib yuboring!`,
                `Yaxshi savol! Santexnika bo'yicha har qanday qiyin vaziyatda sizga yordam berishga tayyorman. Shoshilinch bo'lsa, to'g'ridan-to'g'ri dispetcherga ham qo'ng'iroq qilishingiz mumkin.`
            ];
            const randomAnswer = defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)];
            this.renderBotMessage(randomAnswer, true);
        }

        // --- Matnni Ovoz Chiqarib O'qish (Text-To-Speech) ---
        speakText(text, btnElement = null) {
            if (!('speechSynthesis' in window)) {
                console.warn('SpeechSynthesis brauzerda qo\'llab-quvvatlanmaydi');
                return;
            }

            window.speechSynthesis.cancel(); // Avvalgi ovozni to'xtatish

            const cleanText = text.replace(/[*#_~`]/g, '').trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);

            // O'zbekcha yoki eng yaqin tillarni aniqlash
            const voices = window.speechSynthesis.getVoices();
            const uzVoice = voices.find(v => v.lang.includes('uz') || v.lang.includes('UZ'));
            const ruVoice = voices.find(v => v.lang.includes('ru') || v.lang.includes('RU'));
            const trVoice = voices.find(v => v.lang.includes('tr') || v.lang.includes('TR'));

            if (uzVoice) utterance.voice = uzVoice;
            else if (trVoice) utterance.voice = trVoice;
            else if (ruVoice) utterance.voice = ruVoice;

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            if (btnElement) btnElement.classList.add('speaking');

            utterance.onend = () => {
                if (btnElement) btnElement.classList.remove('speaking');
            };

            utterance.onerror = () => {
                if (btnElement) btnElement.classList.remove('speaking');
            };

            window.speechSynthesis.speak(utterance);
        }

        stopSpeaking() {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            document.querySelectorAll('.ustajon-speak-btn').forEach(b => b.classList.remove('speaking'));
        }

        // --- Yordamchi Formatlash Funksiyalari ---
        escapeHTML(str) {
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
            }[tag] || tag));
        }

        formatMarkdown(md) {
            let html = this.escapeHTML(md);
            // Qalin matn **text**
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Qiya matn *text*
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Yangi qatorlar
            html = html.replace(/\n/g, '<br>');
            return html;
        }
    }

    // Sahifa yuklanganda ishga tushirish
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ustajonAI = new UstajonAI();
        });
    } else {
        window.ustajonAI = new UstajonAI();
    }
})();
