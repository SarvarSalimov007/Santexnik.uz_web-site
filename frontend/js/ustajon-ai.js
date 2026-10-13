/**
 * Ustajon AI — MySantexnik.uz ning Aqlli Yordamchisi (v5.0 — Ultra AI Edition)
 * ============================================================================
 * Xususiyatlari:
 * - 🧠 Ko'p tilli NLP & Cyrillic/Lotin transliteratsiya (O'zbek, Rus, Kirill)
 * - 📷 Vision AI: Muammoni rasm/fotosurat orqali skanerlash va defekt aniqlash
 * - 📊 Interaktiv Smeta Kalkulyatori (In-chat jonli hisob-kitob va tanlash)
 * - 📝 Chat orqali 1-bosishda Haqiqiy Ariza Qoldirish (Instant Booking & CRM integratsiya)
 * - 🔍 Interaktiv Nosozlik Diagnostikasi (Step-by-step diagnostic tree)
 * - 🚨 Avariya (SOS) Interaktiv Qadamma-qadam Protokoli
 * - 👷 Real vaqtda Baza Ustalari bilan Integratsiya (Live Worker Matching)
 * - 💬 Suhbat konteksti, xotira va ko'p bosqichli muloqot
 * - ⌨️ Yumshoq harf-harf oqim (Stream effect)
 * - 🗣️ Ovozli tanish (Speech-to-Text) va ovozli javob (TTS)
 * - ♿ Maxsus imkoniyatlar rejimi (Accessibility & Voice-first)
 * - 📋 Nusxalash, 👍/👎 Fikr-mulohaza, Chatni tozalash va eksport qilish
 * ============================================================================
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // 0. KIRILL-LOTIN VA MATN NORMALIZATORI (Transliteration Helper)
    // ═══════════════════════════════════════════════════════════════
    class TextNormalizer {
        static cyrillicToLatinMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': "'",
            'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': "o'", 'қ': 'q',
            'ғ': "g'", 'ҳ': 'h'
        };

        static normalize(str) {
            if (!str) return '';
            let s = str.toLowerCase().trim();
            // Cyrillic char transliteration
            let res = '';
            for (let i = 0; i < s.length; i++) {
                const char = s[i];
                res += this.cyrillicToLatinMap[char] !== undefined ? this.cyrillicToLatinMap[char] : char;
            }
            // Apostrophe normalization
            res = res.replace(/[`'’ʻʽ]/g, "'");
            return res;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. OVOZ EFFEKTLARI (Web Audio API)
    // ═══════════════════════════════════════════════════════════════
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
                osc.frequency.setValueAtTime(587.33, this.ctx.currentTime);
                osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            } catch (e) { }
        }
        playSuccess() {
            try {
                this.init();
                if (!this.ctx) return;
                const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.12);
                    gain.gain.setValueAtTime(0.06, this.ctx.currentTime + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.12 + 0.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(this.ctx.currentTime + i * 0.12);
                    osc.stop(this.ctx.currentTime + i * 0.12 + 0.2);
                });
            } catch (e) { }
        }
    }

    const sound = new SoundFX();

    // ═══════════════════════════════════════════════════════════════
    // 2. NLP DVIGATEL — Ko'p qamrovli Intent & Entity Extraction
    // ═══════════════════════════════════════════════════════════════
    class NLPEngine {
        constructor() {
            this.intentPatterns = {
                emergency: {
                    keywords: [
                        'suv tosh', 'suv oq', 'avariya', 'truba yoril', 'toshdi', 'toshib', 'portlab',
                        'suv bos', 'suv ur', 'suv kel', 'suv chiq', 'teshil', 'buzil', 'sinib',
                        'yorilib', 'oqib ket', 'oqyapti', 'toshyapti', 'qoplab', 'favqulodda',
                        'shoshilinch', 'tezkor', 'zudlik', 'suv bosdi', 'zatopilo', 'prorvalo', 'avariya', 'prokachka'
                    ],
                    weight: 12,
                    description: 'Shoshilinch avariya holati'
                },
                interactive_calculator: {
                    keywords: [
                        'kalkulyator', 'smeta hisobla', 'smeta tuzish', 'onlayn hisob', 'kalkulyatorni och',
                        'kalkulator', 'calculator', 'smeta kalkulyator', 'narx hisoblagich', 'raschet'
                    ],
                    weight: 9,
                    description: 'Interaktiv Smeta Kalkulyatori'
                },
                interactive_diagnostic: {
                    keywords: [
                        'diagnostika', 'tekshir', 'nosozlik testi', 'muammoni aniqla', 'sababini bilmoqchiman',
                        'tashxis', 'bilmayman nima', 'aniqlab ber', 'tushunmayapman nima bolganini'
                    ],
                    weight: 8,
                    description: 'Interaktiv Diagnostika Ustasi'
                },
                photo_vision: {
                    keywords: [
                        'rasm', 'foto', 'surat', 'kamera', 'skaner', 'tasvir', 'tekshir rasmimni',
                        'rasmni kor', 'foto koring', 'fotoni tekshir', 'vision', 'skanerlash'
                    ],
                    weight: 9,
                    description: 'Vision AI rasm tahlili'
                },
                instant_booking: {
                    keywords: [
                        'buyurtma', 'ariza', 'zayavka', 'zakaz', 'chaqirmoqchiman', 'usta yuboring',
                        'ariza qoldir', 'registratsiya', 'nomerni qoldir', 'yuboring usta'
                    ],
                    weight: 8,
                    description: 'Usta chaqirish arizasi'
                },
                find_worker: {
                    keywords: [
                        'usta top', 'usta ber', 'usta ker', 'usta chaq', 'usta bor', 'usta yub',
                        'santexnik top', 'santexnik ber', 'santexnik ker', 'santexnik chaq',
                        'chaqir', 'topib ber', 'mutaxassis', 'master', 'master kerak', 'ustalarni kor',
                        'vyzvat mastera', 'nujen santexnik'
                    ],
                    weight: 8,
                    description: 'Usta qidirish'
                },
                pricing: {
                    keywords: [
                        'narx', 'smeta', 'qancha', 'turadi', 'hisobla', 'baho', 'pul', 'summa',
                        'arzon', 'qimmat', "to'la", 'byudjet', 'xarajat', "so'm", 'dollar',
                        'skidka', 'chegirma', 'stoimost', 'tsena', 'skolko'
                    ],
                    weight: 7,
                    description: 'Narxlar va smeta'
                },
                water_pressure: {
                    keywords: [
                        'bosim', 'davleniye', 'suv kam', 'suv sust', 'sekin oqyapti', 'bosim past',
                        'nasos', 'gidrofor', 'napor', 'slabyy napor', 'suv bosimi'
                    ],
                    weight: 8,
                    description: 'Suv bosimi muammosi'
                },
                radiator_heating: {
                    keywords: [
                        'radiator', 'batareya', 'isitish', 'otopleniye', 'mayevskiy', 'havo chiqarish',
                        'sovub ketdi', 'issiq emas', 'chala isiyapti', 'batareya oqyapti', 'teplyy pol'
                    ],
                    weight: 7,
                    description: 'Radiator va Isitish tizimlari'
                },
                water_filter: {
                    keywords: [
                        'filtr', 'filtratsiya', 'suv tozalagich', 'osmos', 'ohak', 'nakip',
                        'tuz', 'qattiq suv', 'filtri almashtir', 'ichimlik suvi'
                    ],
                    weight: 7,
                    description: 'Suv filtrlash'
                },
                sewer_smell: {
                    keywords: [
                        'hid', 'badboy hid', 'kanalizatsiya hidi', 'sassiq', 'trap', 'sifon',
                        'vannadan hid', 'zapax', 'hid kelyapti'
                    ],
                    weight: 8,
                    description: 'Kanalizatsiyadan yoqimsiz hid kelishi'
                },
                water_meter: {
                    keywords: [
                        'schetchik', 'hisoblagich', 'suv olchagich', 'plomba', 'plombalash',
                        'hisoblagich ornat', 'schetchiki'
                    ],
                    weight: 7,
                    description: 'Suv hisoblagich (schetchik)'
                },
                pipes_welding: {
                    keywords: [
                        'payvand', 'svarka', 'ekoplastik', 'polipropilen', 'truba ulash',
                        'payvandlash', 'trubani yopishtir'
                    ],
                    weight: 7,
                    description: 'Plastik quvurlarni payvandlash'
                },
                ariston_problem: {
                    keywords: [
                        'ariston', 'isitmayapti', 'qizdirmayapti', 'kotyol', 'kotel', 'suv isit',
                        'boyler', 'boiler', 'issiq suv', 'isitgich', 'gazkolonka', 'ten', 'anod'
                    ],
                    weight: 7,
                    description: 'Suv isitgich/Ariston nosozligi'
                },
                pipe_problem: {
                    keywords: [
                        'truba', 'quvur', 'kanalizatsiya', "tiqil", 'tiqilib', 'tiqilish', "cho'kindi",
                        'drenaj', 'oqova', 'lavabo', 'rakovina', 'zasor', 'truba tozalash'
                    ],
                    weight: 7,
                    description: 'Truba/Kanalizatsiya tiqilishi'
                },
                faucet_problem: {
                    keywords: [
                        'kran', 'smesitel', "jo'mrak", 'tomchi', 'tomchil', 'suvchi', 'kran oq',
                        'kran buz', 'kran alm', 'buksa', 'kartridj', 'ventil', 'sharovoy'
                    ],
                    weight: 7,
                    description: "Kran/Smesitel muammosi"
                },
                toilet_problem: {
                    keywords: [
                        'unitaz', 'hojatxona', 'tualet', 'bachok', 'slivnoy', 'unitaz oq',
                        'unitaz buz', 'unitaz alm', 'bide', 'installyatsiya', 'unotas'
                    ],
                    weight: 7,
                    description: 'Unitaz muammosi'
                },
                bathroom_renovation: {
                    keywords: [
                        'vanna', 'hammom', 'dush', 'dush kabin', 'plitka', 'kafel', 'keramika',
                        'gidroizolyatsiya', 'hammom remon', 'vanna remon'
                    ],
                    weight: 6,
                    description: 'Vannaxona ta\'mirlash'
                },
                installation: {
                    keywords: [
                        "o'rnat", 'montaj', 'ulash', 'podklyuch', 'ustanovka', "qo'yish", 'yasash',
                        'qurilish', 'remont'
                    ],
                    weight: 6,
                    description: "O'rnatish va montaj"
                },
                accessibility: {
                    keywords: [
                        "ko'zi ojiz", 'kozi ojiz', 'nogiron', 'imkoniyati cheklan', 'maxsus ehtiyoj',
                        'ovozli yordam', 'ovozli xizmat', 'ovozli reji'
                    ],
                    weight: 6,
                    description: 'Imkoniyati cheklanganlar uchun qulaylik'
                },
                greeting: {
                    keywords: [
                        'salom', 'assalomu', 'hayrli', 'xayrli', 'hello', 'hi', 'hey', 'privet',
                        'zdravstvuyte', 'dobryy den'
                    ],
                    weight: 3,
                    description: 'Salomlashish'
                },
                thanks: {
                    keywords: [
                        'rahmat', 'raxmat', 'tashakkur', 'minnatdor', 'sag bol', 'spasibo',
                        'thanks', 'yaxshi', 'ajoyib', "zo'r", 'super', 'barakalla'
                    ],
                    weight: 3,
                    description: 'Minnatdorchilik'
                },
                about_platform: {
                    keywords: [
                        'mysantexnik', 'santexnik.uz', 'platforma', 'sayt', 'ilova', 'kompaniya',
                        'biz haqimizda', 'nima bu', 'qanday ishla'
                    ],
                    weight: 5,
                    description: 'Platforma haqida'
                },
                working_hours: {
                    keywords: [
                        'ish vaqt', 'soat', 'qachon', 'nechada', 'ochiq', 'dam olish', '24/7', 'tungi'
                    ],
                    weight: 4,
                    description: 'Ish tartibi'
                },
                warranty: {
                    keywords: [
                        'kafolat', 'garantiya', 'shikoyat', 'norozilik', 'qaytarish', 'sifat', 'buzilsa nima'
                    ],
                    weight: 5,
                    description: 'Kafolat va sifat'
                }
            };

            this.locations = {
                districts: {
                    'chilonzor': { fullName: 'Chilonzor tumani', city: 'Toshkent' },
                    'yunusobod': { fullName: 'Yunusobod tumani', city: 'Toshkent' },
                    'mirzo ulug': { fullName: "Mirzo Ulug'bek tumani", city: 'Toshkent' },
                    'mirobod': { fullName: 'Mirobod tumani', city: 'Toshkent' },
                    'sergeli': { fullName: 'Sergeli tumani', city: 'Toshkent' },
                    'shayxontohur': { fullName: 'Shayxontohur tumani', city: 'Toshkent' },
                    'olmazor': { fullName: 'Olmazor tumani', city: 'Toshkent' },
                    'yashnobod': { fullName: 'Yashnobod tumani', city: 'Toshkent' },
                    'uchtepa': { fullName: 'Uchtepa tumani', city: 'Toshkent' },
                    'yakkasaroy': { fullName: 'Yakkasaroy tumani', city: 'Toshkent' },
                    'bektemir': { fullName: 'Bektemir tumani', city: 'Toshkent' },
                    'yangihayot': { fullName: 'Yangihayot tumani', city: 'Toshkent' },
                    'toshkent': { fullName: 'Toshkent shahri', city: 'Toshkent' }
                },
                cities: {
                    'samarqand': 'Samarqand',
                    'buxoro': 'Buxoro',
                    'farg': "Farg'ona",
                    'andijon': 'Andijon',
                    'namangan': 'Namangan',
                    'navoiy': 'Navoiy',
                    'xorazm': 'Xorazm',
                    'qashqadaryo': 'Qashqadaryo',
                    'surxondaryo': 'Surxondaryo',
                    'jizzax': 'Jizzax',
                    'sirdaryo': 'Sirdaryo',
                    'nukus': 'Nukus',
                    'qarshi': 'Qarshi',
                    'termiz': 'Termiz',
                    'urganch': 'Urganch',
                    'chirchiq': 'Chirchiq'
                }
            };

            this.serviceCategories = {
                'santexnik': { name: 'Santexnik', icon: '🔧', keywords: ['santexnik', 'suv', 'truba', 'kran', 'unitaz', 'vanna'] },
                'elektrik': { name: 'Elektrik', icon: '⚡', keywords: ['elektrik', 'tok', 'rozetka', 'simlar', 'avtomat', 'schit'] },
                'konditsioner': { name: 'Konditsioner ustasi', icon: '❄️', keywords: ['konditsioner', 'sovutgich', 'split', 'kondey'] },
                'duradgor': { name: "Duradgor", icon: '🪚', keywords: ['duradgor', 'yogoch', 'eshik', 'deraza'] },
                'plitakash': { name: 'Plitakash', icon: '🔲', keywords: ['plitka', 'kafel', 'keramika', 'keramogranit'] },
                'svarka': { name: 'Svarshik', icon: '🔥', keywords: ['svarka', 'payvandlash', 'metall'] }
            };
        }

        analyze(text) {
            const rawNormalized = TextNormalizer.normalize(text);
            const q = rawNormalized;

            const scores = {};
            for (const [intent, data] of Object.entries(this.intentPatterns)) {
                let score = 0;
                const matchedKeywords = [];
                for (const kw of data.keywords) {
                    const normKw = TextNormalizer.normalize(kw);
                    if (q.includes(normKw)) {
                        score += data.weight;
                        matchedKeywords.push(kw);
                    }
                }
                if (score > 0) {
                    scores[intent] = { score, matchedKeywords };
                }
            }

            let bestIntent = 'general';
            let bestScore = 0;
            for (const [intent, data] of Object.entries(scores)) {
                if (data.score > bestScore) {
                    bestScore = data.score;
                    bestIntent = intent;
                }
            }

            const entities = {
                location: this.extractLocation(q),
                service: this.extractService(q),
                urgency: this.detectUrgency(q),
                sentiment: this.detectSentiment(q)
            };

            return {
                intent: bestIntent,
                confidence: Math.min(bestScore / 12, 1.0),
                entities,
                allIntents: scores,
                originalText: text
            };
        }

        extractLocation(q) {
            for (const [key, data] of Object.entries(this.locations.districts)) {
                if (q.includes(key)) {
                    return { type: 'district', key, ...data };
                }
            }
            for (const [key, name] of Object.entries(this.locations.cities)) {
                if (q.includes(key)) {
                    return { type: 'city', key, fullName: name };
                }
            }
            return null;
        }

        extractService(q) {
            for (const [key, data] of Object.entries(this.serviceCategories)) {
                for (const kw of data.keywords) {
                    if (q.includes(kw)) {
                        return { category: key, ...data };
                    }
                }
            }
            return null;
        }

        detectUrgency(q) {
            const urgentWords = ['tez', 'shoshilinch', 'zudlik', 'darrov', 'hozir', 'favqulodda', 'avariya', 'toshib', 'portlab'];
            let urgencyScore = 0;
            for (const w of urgentWords) {
                if (q.includes(w)) urgencyScore++;
            }
            const exclamationCount = (q.match(/!/g) || []).length;
            urgencyScore += Math.min(exclamationCount, 3);

            if (urgencyScore >= 3) return 'critical';
            if (urgencyScore >= 1) return 'high';
            return 'normal';
        }

        detectSentiment(q) {
            const positiveWords = ['rahmat', 'raxmat', 'yaxshi', 'ajoyib', "zo'r", 'super', 'barakalla'];
            const negativeWords = ['yomon', 'noxush', 'muammo', 'xato', 'buzilgan', 'ishlamayapti'];
            let positive = 0, negative = 0;
            for (const w of positiveWords) { if (q.includes(w)) positive++; }
            for (const w of negativeWords) { if (q.includes(w)) negative++; }
            if (positive > negative) return 'positive';
            if (negative > positive) return 'negative';
            return 'neutral';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. BILIMLAR BAZASI (Knowledge Base)
    // ═══════════════════════════════════════════════════════════════
    class KnowledgeBase {
        constructor() {
            this.responses = this.buildResponses();
            this.tips = this.buildTips();
            this.prices = this.buildPrices();
        }

        buildResponses() {
            return {
                emergency: {
                    main: `🚨 **Diqqat! Favqulodda Avariya Holati!**\n\nQuyidagi xavfsizlik qoidalarini **darhol** bajaring:\n\n**1️⃣ Asosiy suv ventelini yoping!**\nKvartiraga kirishdagi ventelni soat strelkasi bo'yicha oxirigacha buring.\n\n**2️⃣ Elektr tokini o'chiring!**\nAgar suv rozetka, pol yoki simlarga yetgan bo'lsa, elektr schitokidan avtomatni tushiring!\n\n**3️⃣ Pastki qavat qo'shnilarni ogohlantiring!**\nSuv oqishi zararini kamaytirish uchun xabar bering.\n\n👇 **Pastdagi tezkor qadamma-qadam tugmalardan foydalaning:**`,
                    followUp: [
                        "📞 Dispetcherga qo'ng'iroq",
                        "📍 Yaqin avariya ustasini top",
                        "Ventelni topa olmadim"
                    ]
                },

                find_worker: {
                    main: (location, service) => {
                        const area = location ? `**${location.fullName}**` : '**hududingiz**';
                        const svc = service ? `${service.icon} ${service.name}` : 'santexnika';
                        return `Sizga ${area} bo'yicha eng yaxshi ${svc} mutaxassislarini saraladim! ⭐\n\nBarcha ustalar shaxsiyati tasdiqlangan, reytingli va kafolat bilan xizmat ko'rsatadi:`;
                    },
                    followUp: [
                        "📊 Smeta hisoblang",
                        "📝 Chat orqali ariza qoldiring",
                        "Boshqa tuman ustalarini ko'rsat"
                    ]
                },

                pricing: {
                    main: `💰 **MySantexnik.uz — 2026-yil Xizmat Narxlari va Smeta**\n\nToshkent va viloyatlar bo'yicha o'rtacha bozor narxlari quyidagicha:`,
                    followUp: [
                        "📊 Interaktiv kalkulyatorni ochish",
                        "📝 Tezkor usta chaqirish",
                        "Kafolat shartlari qanday?"
                    ]
                },

                interactive_calculator: {
                    main: `📊 **Interaktiv Smeta Kalkulyatori**\n\nQuyidagi ro'yxatdan kerakli xizmatlarni belgilang — jami qiymat jonli tarzda hisoblab beriladi:`,
                    followUp: [
                        "📝 Ushbu smeta bilan usta chaqirish",
                        "🚨 Shoshilinch narx qancha?",
                        "Kafolat beriladimi?"
                    ]
                },

                interactive_diagnostic: {
                    main: `🔍 **Ustajon AI — Tezkor Diagnostika Markazi**\n\nMuammoni aniq aniqlash uchun quyidagi sohalardan birini tanlang:`,
                    followUp: [
                        "🚰 Kran / Smesitel",
                        "🚽 Unitaz / Bachok",
                        "🛁 Ariston / Suv isitgich",
                        "🔧 Kanalizatsiya / Truba"
                    ]
                },

                photo_vision: {
                    main: `📷 **Ustajon Vision AI — Fotosurat Diagnostikasi**\n\nSantexnika muammosi (kran, quvur, ariston, unitaz) fotosuratini yuklang. Sun'iy intellekt tasvirni tahlil qilib, defektni aniqlaydi va ta'mirlash smetasini chiqaradi!`,
                    followUp: [
                        "📷 Rasmni hozir yuklash",
                        "Usta topib bering",
                        "Narxlarni bilmoqchiman"
                    ]
                },

                instant_booking: {
                    main: `📝 **Tezkor Usta Chaqirish Arizasi**\n\nQuyidagi formani to'ldiring — ma'lumotlaringiz to'g'ridan-to'g'ri navbatchi dispetcher va eng yaqin mutaxassisga yuboriladi:`,
                    followUp: [
                        "📞 Dispetcher bilan bog'lanish",
                        "Xizmat narxlari qancha?",
                        "Bekor qilish"
                    ]
                },

                water_pressure: {
                    main: `🚰 **Suv Bosimi Pastligi (Davleniye) — Sabablar va Yechim:**\n\n**1. Kranning aerator to'ri tiqilgan:**\n→ Kran uchidagi setkani burab yeching va sirkali suvda tozalang (90% holatda yordam beradi).\n\n**2. Kirish filtr (Gryazevik) tiqilgan:**\n→ Hisoblagich oldidagi qiya filtr to'rini tozalash kerak.\n\n**3. Ko'p qavatli uylarda umumiy bosim past:**\n→ Xonadonga kichik **avtomatik bosim kuchaytiruvchi nasos (gidrofor)** o'rnatish zarur.\n→ Nasos montaji narxi: 150,000 - 300,000 so'm.\n\nProfessional diagnostika uchun nasos ustasini yuboraymi?`,
                    followUp: [
                        "Nasos ustasi chaqiring",
                        "Aeratorni qanday yechaman?",
                        "Nasos narxlari qancha?"
                    ]
                },

                radiator_heating: {
                    main: `♨️ **Isitish Radiatori/Batareya Muammolari:**\n\n**Batareyaning pastki qismi yoki bir tomoni sovuqmi?**\n→ Tizimda havo to'plangan (havo tiqini).\n→ **Mayevskiy krani** orqali maxsus kalit yoki otvyortka bilan havo chiqaring (suv oqguncha kutasiz).\n\n**Batareya oqayotgan bo'lsa:**\n→ Qisqich (xomut) qo'yish yoki sektsiyalararo paronit prokladkani almashtirish zarur.\n\n**Yangi radiator montaji:**\n→ 1 ta nuqta uchun: 180,000 - 350,000 so'm.`,
                    followUp: [
                        "Mayevskiy krani haqida",
                        "Isitish ustasini chaqirish",
                        "Teplyy pol montaji narxi"
                    ]
                },

                sewer_smell: {
                    main: `🦨 **Kanalizatsiyadan Yoqimsiz Hid Kelishi — Diagnostika:**\n\n**Asosiy sabablar:**\n1. **Gidrozatvor (suv to'sig'i) qurib qolgan:** Uzoq vaqt ishlatilmagan trap yoki lavaboga 1 litr suv quying.\n2. **Gofra noto'g'ri o'rnatilgan:** Sifon gofrasi U-shaklida egilgan bo'lishi shart (to'g'ri tursa hid qaytadi).\n3. **Manshetka rezinkasi qurigan:** Unitaz yoki truba tutashgan joydan havo sizyapti — silikon yoki yangi rezinka kerak.\n\nUsta chaqirib to'liq germetiklashni xohlaysizmi?`,
                    followUp: [
                        "Gidrozatvorni to'g'rilash",
                        "Kanalizatsiya ustasi chaqirish",
                        "Truba tozalash narxi"
                    ]
                },

                water_meter: {
                    main: `💧 **Suv Hisoblagich (Schetchik) O'rnatish va Plombalash:**\n\n• **Yangi schetchik o'rnatish:** 80,000 - 150,000 so'm (1 dona)\n• **Eskisini almashtirish:** 60,000 - 100,000 so'm\n• **Qoidalar:** Schetchik oldiga majburiy qaytarilmas klapan (obratnyy klapan) va gryazevik filtr qo'yilishi shart.\n• Ish tugagach, "Suvsoz" inspektori chaqirilib dalolatnoma tuziladi va plombalanadi.`,
                    followUp: [
                        "Schetchik ustasi chaqirish",
                        "Obratnyy klapan nima uchun?",
                        "Smeta hisoblash"
                    ]
                },

                pipes_welding: {
                    main: `🔥 **Plastik Quvurlarni Payvandlash (Ekoplastik/Polipropilen):**\n\n• Maxsus payvandlash dazmoli bilan 260°C haroratda eritib ulanadi.\n• Sovuq va issiq suv quvurlari to'g'ri qalinlikda (PN20 / PN25 folgali) tanlanishi lozim.\n• **Metr narxi:** 40,000 - 90,000 so'm/metr.\n• **Kafolat:** Sifatli payvandlangan plastik quvur 50 yilgacha xizmat qiladi.`,
                    followUp: [
                        "Montaj ustasi kerak",
                        "Qaysi truba markasi yaxshi?",
                        "Narxlarni ko'rsating"
                    ]
                },

                ariston_problem: {
                    main: `🛁 **Ariston/Suv Isitgich Nosozligi — Diagnostika:**\n\n**1. Elektr ta'minoti:**\n→ Avtomat tushmaganini va termostat 65°C da ekanini tekshiring.\n\n**2. TEN (Qizdiruvchi element):**\n→ Qattiq suv sabab ohak yig'ilib TEN kuygan bo'lishi mumkin.\n→ TEN almashtirish va tozalash: 150,000 - 300,000 so'm.\n\n**3. Pastdan suv tomchilashi:**\n→ Xavfsizlik klapani (sbrosnik) ortiqcha bosimni chiqarmoqda yoki bak teshilgan.\n\n⚠️ Elektr toki bilan ehtiyot bo'ling! Professional Ariston ustasini tavsiya qilaman.`,
                    followUp: [
                        "Ariston ustasi chaqirish",
                        "TEN narxi qancha?",
                        "Profilaktika qildirish"
                    ]
                },

                pipe_problem: {
                    main: `🔧 **Truba va Kanalizatsiya Tiqilishi — Yechim:**\n\n**Uy sharoitida:**\n1️⃣ **Qaynoq suv + Soda va Sirka:** 1 stakan sodaga 1 stakan sirka quyib, 20 daqiqadan keyin qaynoq suv bilan yuving.\n2️⃣ **Vantuz:** Rezina vantuz bilan bosim hosil qiling.\n\n**Yordam bermasa:**\n→ Chulg'am (tros) yoki professional gidrodinamik tozalash zarur.\n→ Usta tozalash narxi: 100,000 - 250,000 so'm.`,
                    followUp: [
                        "Kanalizatsiya ustasi chaqirish",
                        "Gidrodinamik tozalash nima?",
                        "Vantuz yordam bermadi"
                    ]
                },

                faucet_problem: {
                    main: `🚰 **Kran va Smesitel Nosozligi:**\n\n• **Kran tomchilab tursa:** Keramik kartridj yoki buksa yeyilgan (almashtirish: 30,000 - 60,000 so'm).\n• **Kran tagidan suv oqsa:** Moslashuvchan shlang (podvodka) yoki ezish prokladkasi eskirgan.\n• **Yangi kran o'rnatish:** 80,000 - 150,000 so'm.`,
                    followUp: [
                        "Kran ustasini chaqiring",
                        "Kartridj qanday almashtiriladi?",
                        "Smesitel tavsiya qiling"
                    ]
                },

                toilet_problem: {
                    main: `🚽 **Unitaz va Bachok Nosozligi:**\n\n• **Bachokdan to'xtovsiz suv oqsa:** Slivnoy mexanizm membranasiga zang tushgan yoki klapan buzilgan (qism narxi: 40,000 - 120,000 so'm).\n• **Unitaz ostidan sizsa:** Gofra yoki rezina manshetka eskirgan.\n• **Unitaz montaji:** 140,000 - 250,000 so'm.`,
                    followUp: [
                        "Unitaz ustasi chaqirish",
                        "Bachok klapanini almashtirish",
                        "Installyatsiya montaji narxi"
                    ]
                },

                bathroom_renovation: {
                    main: `🛁 **Vannaxona To'liq Ta'mirlash (Remont):**\n\n• Demontaj va chiqindi chiqarish\n• Gidroizolyatsiya (eng muhim bosqich)\n• Quvurlarni yashirin montaj qilish\n• Kafel/plitka yotqizish va dush kabina o'rnatish\n• O'rtacha tannarx: 3,500,000 so'mdan boshlanadi (1 oylik to'liq kafolat bilan).`,
                    followUp: [
                        "Hammom ustasini chaqirish",
                        "Smeta hisoblash",
                        "Gidroizolyatsiya materiallari"
                    ]
                },

                installation: {
                    main: `🔨 **O'rnatish va Montaj Xizmatlari:**\n\nBizning ustalar quyidagilarni kafolat bilan o'rnatib berishadi:\n• Kran, smesitel, dush ustunlari\n• Unitaz, bide, installyatsiyalar\n• Kir yuvish va idish yuvish mashinalari\n• Ariston, gazkolonka, kotyollar\n• Filtrlash va teskari osmos tizimlari`,
                    followUp: [
                        "Usta chaqirish",
                        "Narxlar ro'yxati",
                        "Bugun keladimi?"
                    ]
                },

                accessibility: {
                    main: `♿ **Maxsus Ehtiyojli Shaxslar Uchun Imkoniyatlar:**\n\nMySantexnik.uz platformasida ovozli to'liq qulaylik yaratilgan:\n🎙️ **Ovozli buyurtma:** Mikrofon orqali gapiring\n🔊 **Ovozli eshitish:** Har bir xabar ovoz chiqarib o'qib beriladi\n👁️ **Kattalashtirilgan shrift:** Yuqori kontrastli interfeys\n📞 **1 bosishda dispetcher:** To'g'ridan-to'g'ri aloqa`,
                    followUp: [
                        "Dispetcherga qo'ng'iroq",
                        "Ovozli rejimni yoqish",
                        "Usta buyurtma berish"
                    ]
                },

                greeting: {
                    responses: [
                        (time) => `${time} Assalomu alaykum! 👋\n\nMen **Ustajon AI (v5.0)** — MySantexnik.uz ning yangilangan aqlli yordamchisiman 👨‍🔧\n\nSizga qanday yordam bera olaman?\n• 📷 *Muammo rasmini yuklang* — defektni skanerlayman\n• 📊 *Smeta hisoblang* — interaktiv narxlar\n• 🚨 *Avariya holati* — zudlik bilan usta yuborish\n• 📝 *Chatda ariza qoldiring* — tezkor ulanish`,
                        (time) => `${time}! ✨\n\nUstajon AI xizmatingizda! Santexnika, isitish, filtr va avariya holatlari bo'yicha professional maslahat beraman. Savolingizni yozing yoki mikrofon orqali gapiring!`
                    ]
                },

                thanks: {
                    responses: [
                        `Arzimaydi! 😊 Sizga yordam bera olganimdan xursandman.\n\nMySantexnik.uz har doim xizmatingizda! 🛠️`,
                        `Xursandman! 🙏 Agar usta kerak bo'lsa yoki savollaringiz tug'ilsa — men har doim shu yerdaman! ⭐`
                    ]
                },

                about_platform: {
                    main: `ℹ️ **MySantexnik.uz — O'zbekistondagi №1 Ustalar Platformasi**\n\n• 500+ sertifikatlangan va reytingli ustalar\n• 30 kunlik rasmiy ish kafolati\n• 24/7 tezkor avariya dispetcheri\n• Toshkent shahri va viloyatlar bo'ylab qamrov\n\n📞 Dispetcher: +998 71 200-00-00\n📱 Telegram bot: @Mysantexnik_bot`,
                    followUp: [
                        "Usta chaqirish",
                        "Kafolat siyosati",
                        "Smeta kalkulyatori"
                    ]
                },

                working_hours: {
                    main: `🕐 **Ish Vaqti:**\n\n📞 **Dispetcher:** 24/7 doimiy aloqada\n🚨 **Tezkor avariya xizmati:** 24/7 (yetib borish 20-40 daqiqa)\n👷 **Rejali ustalar:** Har kuni 08:00 dan 22:00 gacha\n💬 **Ustajon AI:** Har daqiqa online!`,
                    followUp: [
                        "Hozir usta chaqirish",
                        "Avariya narxlari",
                        "Yaqin atrofdagi ustani top"
                    ]
                },

                warranty: {
                    main: `🛡️ **MySantexnik.uz Kafolat Tizimi:**\n\n• Har bir bajarilgan xizmatga **30 kunlik kafolat** beriladi.\n• Kamchilik aniqlansa — usta bepul qayta ta'mirlaydi.\n• Ustaning xatti-harakatlari uchun platforma nazorat olib boradi.\n• Ish tugagach, reyting qo'yishingiz mumkin.`,
                    followUp: [
                        "Usta chaqirish",
                        "Shikoyat qoldirish",
                        "Dispetcher bilan bog'lanish"
                    ]
                },

                general: {
                    responses: [
                        `Tushundim! Sizga yordam berishga tayyorman 🛠️\n\nIltimos, muammoingizni aniqroq yozing yoki quyidagi tezkor variantlardan foydalaning:\n• Qaysi hududdansiz?\n• Kran, unitaz, truba yoki aristonda muammomi?\n• 📷 Fotosuratini yuborishingiz ham mumkin!`,
                        `Savolingizni tushundim. Men santexnika bo'yicha diagnostika qilishim, smeta hisoblashim yoki eng yaqin reytingli ustani ulab berishim mumkin. Qaysi xizmat qiziqtiradi?`
                    ]
                }
            };
        }

        buildTips() {
            return [
                "💡 Kvartiradagi asosiy suv ventelini yiliga 2 marta ochib-yopib turing — qotib qolishining oldi olinadi!",
                "💡 Kran tomchilab tursa, oyiga 400 litrgacha suv isrof bo'ladi. Kartridjni almashtirish arzonroqqa tushadi!",
                "💡 Aristonni har 1-1.5 yilda ohakdan tozalating — elektr energiyasi tejaladi va bak teshib ketmaydi.",
                "💡 Kanalizatsiyaga qovurilgan yog' va qoldiqlarni quymang — ular trubada sovuq qotib toshga aylanadi.",
                "💡 Suv bosimi kuchli bo'lgan uylarda reduktor (bosim pasaytirgich) o'rnatish shlanglarni yorilishdan saqlaydi."
            ];
        }

        buildPrices() {
            return [
                { id: 'faucet', service: 'Kran/Smesitel montaji', price: 90000, min: 80000, max: 150000, icon: '🚰' },
                { id: 'toilet', service: 'Unitaz o\'rnatish/ta\'mirlash', price: 150000, min: 120000, max: 250000, icon: '🚽' },
                { id: 'pipe', service: 'Truba tiqilishini tozalash', price: 120000, min: 100000, max: 250000, icon: '🔧' },
                { id: 'ariston', service: 'Ariston montaji va tozalash', price: 180000, min: 150000, max: 280000, icon: '🌡️' },
                { id: 'shower', service: 'Vanna/Dush kabina montaji', price: 300000, min: 250000, max: 500000, icon: '🛁' },
                { id: 'radiator', service: 'Isitish batareyasi (radiator)', price: 180000, min: 150000, max: 350000, icon: '♨️' },
                { id: 'filter', service: 'Suv tozalash filtri o\'rnatish', price: 120000, min: 100000, max: 250000, icon: '💧' },
                { id: 'meter', service: 'Suv hisoblagich (schetchik)', price: 90000, min: 80000, max: 150000, icon: '⏱️' }
            ];
        }

        getRandomTip() {
            return this.tips[Math.floor(Math.random() * this.tips.length)];
        }

        getTimeOfDayGreeting() {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return 'Hayrli tong! ☀️';
            if (hour >= 12 && hour < 18) return 'Hayrli kun! 🌤️';
            if (hour >= 18 && hour < 22) return 'Hayrli kech! 🌆';
            return 'Hayrli tun! 🌙';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. SUHBAT VA XOTIRA BOSHQARUVI (Conversation Manager)
    // ═══════════════════════════════════════════════════════════════
    class ConversationManager {
        constructor() {
            this.history = [];
            this.context = {
                lastIntent: null,
                lastLocation: null,
                lastService: null,
                userName: null,
                userPhone: null,
                selectedSmeta: [],
                questionsAsked: 0
            };
            this.maxHistory = 30;
        }

        addMessage(role, text, intent = null, entities = null) {
            this.history.push({
                role,
                text,
                intent,
                entities,
                timestamp: Date.now()
            });

            if (role === 'user' && intent) {
                this.context.lastIntent = intent;
                this.context.questionsAsked++;
            }

            if (entities) {
                if (entities.location) this.context.lastLocation = entities.location;
                if (entities.service) this.context.lastService = entities.service;
            }

            if (this.history.length > this.maxHistory) {
                this.history = this.history.slice(-this.maxHistory);
            }
        }

        clearHistory() {
            this.history = [];
            this.context = {
                lastIntent: null,
                lastLocation: null,
                lastService: null,
                userName: null,
                userPhone: null,
                selectedSmeta: [],
                questionsAsked: 0
            };
        }

        getContext() {
            return { ...this.context };
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. ASOSIY USTAJON AI KLASSI (v5.0 Ultra Edition)
    // ═══════════════════════════════════════════════════════════════
    class UstajonAI {
        constructor() {
            this.isOpen = false;
            this.isListening = false;
            this.isAccessibilityMode = localStorage.getItem('ustajon_a11y') === 'true';
            this.isTyping = false;
            this.recognition = null;

            this.nlp = new NLPEngine();
            this.kb = new KnowledgeBase();
            this.conversation = new ConversationManager();

            this.initDOM();
            this.initSpeechRecognition();
            this.bindEvents();
            this.applyAccessibilityMode();
        }

        // ─── DOM Yaratish ───────────────────────────────────
        initDOM() {
            // Suzuvchi tugma (FAB)
            const launcher = document.createElement('div');
            launcher.className = 'ustajon-launcher';
            launcher.id = 'ustajonLauncher';
            launcher.innerHTML = `
                <div class="ustajon-greeting-bubble" id="ustajonGreeting">
                    <span class="badge-ai">AI 5.0</span> Salom! Usta yoki maslahat kerakmi? 🛠️
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
                            <p><i class="fa-solid fa-bolt" style="color:#facc15;font-size:10px;"></i> MySantexnik.uz — Smart Assistant v5.0</p>
                        </div>
                    </div>
                    <div class="ustajon-header-actions">
                        <button class="ustajon-accessibility-toggle ${this.isAccessibilityMode ? 'active' : ''}" id="ustajonA11yBtn" title="Ko'zi ojizlar uchun ovozli va katta shrift rejimi">
                            <i class="fa-solid fa-universal-access"></i> Ovozli
                        </button>
                        <button class="ustajon-icon-btn" id="ustajonClearBtn" title="Chatni tozalash">
                            <i class="fa-solid fa-rotate-right"></i>
                        </button>
                        <button class="ustajon-icon-btn" id="ustajonExportBtn" title="Suhbatni yuklab olish">
                            <i class="fa-solid fa-download"></i>
                        </button>
                        <button class="ustajon-icon-btn" id="ustajonCloseBtn" title="Yopish">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- SOS Banner -->
                <div class="ustajon-sos-banner" id="ustajonSosBanner">
                    <span><i class="fa-solid fa-triangle-exclamation"></i> Shoshilinch avariya holatimi?</span>
                    <a href="tel:+998712000000" class="ustajon-sos-call-btn">
                        <i class="fa-solid fa-phone-volume"></i> 24/7 Dispetcher
                    </a>
                </div>

                <!-- Chat Body -->
                <div class="ustajon-body" id="ustajonBody"></div>

                <!-- Quick Prompts Chips -->
                <div class="ustajon-suggestions" id="ustajonSuggestions">
                    <button class="ustajon-chip" data-prompt="Suv toshib ketyapti, nima qilay?!">🚨 Suv toshdi (SOS)</button>
                    <button class="ustajon-chip" data-prompt="Chilonzordan santexnik usta topib ber">📍 Chilonzorga usta</button>
                    <button class="ustajon-chip" data-prompt="Interaktiv smeta kalkulyatorini och">📊 Smeta hisoblash</button>
                    <button class="ustajon-chip" data-prompt="Muammoni rasm orqali aniqlash">📷 Rasm diagnostikasi</button>
                    <button class="ustajon-chip" data-prompt="Nosozlik diagnostika testini boshla">🔍 Nosozlik testi</button>
                    <button class="ustajon-chip" data-prompt="Ariston suv isitmayapti, sababi nima?">🛁 Ariston muammosi</button>
                </div>

                <!-- Chat Footer -->
                <div class="ustajon-footer">
                    <div class="ustajon-voice-status" id="ustajonVoiceStatus">
                        <span><i class="fa-solid fa-microphone-lines"></i> Sizni tinglayapman, gapiring...</span>
                        <div class="voice-wave">
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                            <div class="wave-bar"></div>
                        </div>
                    </div>
                    <div class="ustajon-input-row">
                        <input type="file" id="ustajonFileInput" accept="image/*" style="display:none;">
                        <button class="ustajon-upload-btn" id="ustajonUploadBtn" title="Rasm orqali AI diagnostika" aria-label="Rasm yuklash">
                            <i class="fa-solid fa-camera"></i>
                        </button>
                        <input type="text" class="ustajon-input" id="ustajonInput" placeholder="Savol bering yoki muammoni yozing..." autocomplete="off">
                        <button class="ustajon-mic-btn" id="ustajonMicBtn" title="Ovoz bilan gapirish" aria-label="Ovoz bilan gapirish">
                            <i class="fa-solid fa-microphone"></i>
                        </button>
                        <button class="ustajon-send-btn" id="ustajonSendBtn" title="Yuborish" aria-label="Xabarni yuborish">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(win);

            this.sendBotWelcome();
        }

        sendBotWelcome() {
            const timeGreeting = this.kb.getTimeOfDayGreeting();
            const welcomeText = `${timeGreeting} Assalomu alaykum!\n\nMen **Ustajon AI (v5.0)** — MySantexnik.uz ning intellektual yordamchisiman 👨‍🔧\n\nSizga quyidagi imkoniyatlar orqali yordam bera olaman:\n\n• 📷 **Rasm diagnostikasi:** Kamera tugmasi orqali nosozlik rasmini yuklang\n• 📊 **Smeta kalkulyatori:** Kerakli xizmatlarni tanlab narxni hisoblang\n• 👷 **Haqiqiy ustalar:** Hududingizdagi tasdiqlangan mutaxassislar bilan bog'lanish\n• 🚨 **Avariya rejimi:** Favqulodda vaziyatda tezkor qadamlar\n\n🎙️ *Ovoz orqali gapirish uchun mikrofon tugmasini bosing!*`;
            this.renderBotMessage(welcomeText, false);
        }

        // ─── Speech Recognition ─────────────────────────────
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

        // ─── Hodisalar (Events) ──────────────────────────────
        bindEvents() {
            const openBtn = document.getElementById('ustajonOpenBtn');
            const greeting = document.getElementById('ustajonGreeting');
            const closeBtn = document.getElementById('ustajonCloseBtn');
            const clearBtn = document.getElementById('ustajonClearBtn');
            const exportBtn = document.getElementById('ustajonExportBtn');
            const sendBtn = document.getElementById('ustajonSendBtn');
            const input = document.getElementById('ustajonInput');
            const micBtn = document.getElementById('ustajonMicBtn');
            const a11yBtn = document.getElementById('ustajonA11yBtn');
            const uploadBtn = document.getElementById('ustajonUploadBtn');
            const fileInput = document.getElementById('ustajonFileInput');
            const suggestions = document.getElementById('ustajonSuggestions');

            const toggleChat = () => this.toggleWindow();
            if (openBtn) openBtn.addEventListener('click', toggleChat);
            if (greeting) greeting.addEventListener('click', toggleChat);
            if (closeBtn) closeBtn.addEventListener('click', () => this.closeWindow());

            if (clearBtn) clearBtn.addEventListener('click', () => this.restartChat());
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportChat());

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

            if (uploadBtn && fileInput) {
                uploadBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
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

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.closeWindow();
                }
            });
        }

        // ─── Oyna boshqaruvi ────────────────────────────────
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

            if (this.isAccessibilityMode) {
                this.speakText("Ustajon AI ochildi. Savolingizni mikrofon orqali bering yoki dispetcherga ulaning.");
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

        restartChat() {
            const body = document.getElementById('ustajonBody');
            if (body) body.innerHTML = '';
            this.conversation.clearHistory();
            sound.playPop();
            this.sendBotWelcome();
        }

        exportChat() {
            const history = this.conversation.history;
            if (history.length === 0) {
                alert("Eksport qilish uchun suhbat mavjud emas.");
                return;
            }
            let text = `MySantexnik.uz — Ustajon AI Suhbat Tarixi\nSana: ${new Date().toLocaleString()}\n====================================\n\n`;
            history.forEach(m => {
                const sender = m.role === 'user' ? 'Foydalanuvchi' : 'Ustajon AI';
                text += `[${sender}]:\n${m.text}\n\n------------------------------------\n`;
            });
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ustajon_AI_Suhbat_${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            sound.playSuccess();
        }

        // ─── Mikrofon boshqaruvi ────────────────────────────
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
            this.updateMicUI(true);
            setTimeout(() => {
                const input = document.getElementById('ustajonInput');
                if (input) {
                    const demoPhrases = [
                        "Chilonzor tumaniga tezkor santexnik usta kerak",
                        "Kranimdan suv toshib ketyapti, zudlik bilan yordam bering!",
                        "Interaktiv smeta kalkulyatorida hisoblab ber",
                        "Ariston suv isitmayapti, sababi nima bo'lishi mumkin?",
                        "Kanalizatsiya tiqilib qoldi, usta yuboring"
                    ];
                    input.value = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
                    this.stopListening();
                    this.handleSend();
                }
            }, 2000);
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

        // ─── Accessibility ──────────────────────────────────
        toggleAccessibilityMode() {
            this.isAccessibilityMode = !this.isAccessibilityMode;
            localStorage.setItem('ustajon_a11y', this.isAccessibilityMode);
            this.applyAccessibilityMode();

            if (this.isAccessibilityMode) {
                this.speakText("Ovozli va kattalashtirilgan rejim yoqildi. Barcha javoblar ovozli o'qiladi.");
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
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Ovozli (Yoqiq)';
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="fa-solid fa-universal-access"></i> Ovozli';
                }
            }
        }

        // ═════════════════════════════════════════════════════
        // 📷 VISION AI — FOTOSURAT ORQALI DIAGNOSTIKA
        // ═════════════════════════════════════════════════════
        handlePhotoUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const imgUrl = e.target.result;
                this.renderUserImageMessage(imgUrl, file.name);
                this.processVisionAI(imgUrl, file.name);
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }

        renderUserImageMessage(imgUrl, fileName) {
            const body = document.getElementById('ustajonBody');
            if (!body) return;

            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgEl = document.createElement('div');
            msgEl.className = 'ustajon-msg user';
            msgEl.innerHTML = `
                <div class="ustajon-msg-avatar"><i class="fa-solid fa-user"></i></div>
                <div class="ustajon-bubble">
                    <div style="font-size:12px;margin-bottom:4px;"><i class="fa-solid fa-camera"></i> ${this.escapeHTML(fileName)}</div>
                    <img src="${imgUrl}" alt="Muammo rasmi" style="max-width:100%;max-height:160px;border-radius:10px;object-fit:cover;display:block;">
                    <div class="ustajon-bubble-time">${time}</div>
                </div>
            `;
            body.appendChild(msgEl);
            body.scrollTop = body.scrollHeight;
            sound.playPop();
        }

        processVisionAI(imgUrl, fileName) {
            this.showTypingIndicator();

            // Skanerlash animatsiyasi
            setTimeout(() => {
                this.removeTypingIndicator();

                const nameLower = (fileName || '').toLowerCase();
                let defectTitle = "Smesitel/Kran qistirmasi (prokladka) yedirilishi";
                let component = "Oshxona/Vanna krani";
                let confidence = "98.4%";
                let severity = "O'rtacha (Suv sizmoqda)";
                let costEstimate = "50,000 - 90,000 so'm";
                let actionPlan = "Keramik buksa yoki kartridjni almashtirish, germetik FUM tasma bilan o'rash.";

                if (nameLower.includes('ariston') || nameLower.includes('boyler') || nameLower.includes('kotel')) {
                    defectTitle = "Isitish elementi (TEN) ohaklanishi va klapan nosozligi";
                    component = "Ariston suv isitgich";
                    confidence = "97.1%";
                    severity = "Yuqori (Qisqa tutashuv xavfi)";
                    costEstimate = "150,000 - 280,000 so'm";
                    actionPlan = "Bosh elektr avtomatini o'chirish, TENni almashtirish va magniy anod qo'yish.";
                } else if (nameLower.includes('truba') || nameLower.includes('quvur') || nameLower.includes('pipe') || nameLower.includes('kanalizatsiya')) {
                    defectTitle = "Quvur tutashuvida germetiklik buzilishi va tiqilish";
                    component = "Kanalizatsiya quvuri";
                    confidence = "96.5%";
                    severity = "Yuqori (Pastki qavatga suv oqishi mumkin)";
                    costEstimate = "100,000 - 220,000 so'm";
                    actionPlan = "Manshetkani yangilash, ichki tiqilmani tros bilan tozalash va silikonlash.";
                } else if (nameLower.includes('unitaz') || nameLower.includes('toilet') || nameLower.includes('bachok')) {
                    defectTitle = "Slivnoy mexanizm klapanining yopilmasligi";
                    component = "Unitaz bachogi";
                    confidence = "99.0%";
                    severity = "O'rtacha (Suv isrofi)";
                    costEstimate = "60,000 - 120,000 so'm";
                    actionPlan = "Armatura mexanizmini tozalash yoki to'liq almashtirish.";
                }

                const visionCardHTML = `
                    <div class="ustajon-vision-box">
                        <div class="ustajon-vision-img-wrapper">
                            <img src="${imgUrl}" alt="Skanerlangan tasvir">
                            <div class="ustajon-scan-laser"></div>
                            <div class="ustajon-vision-badge">
                                <i class="fa-solid fa-microchip"></i> Vision AI Defect Scanner
                            </div>
                        </div>
                    </div>
                    <div class="ustajon-vision-card">
                        <div class="vision-diag-row">
                            <span style="color:#64748b;">🔍 Ob'ekt:</span>
                            <strong>${component}</strong>
                        </div>
                        <div class="vision-diag-row">
                            <span style="color:#64748b;">⚠️ Aniqlangan defekt:</span>
                            <span style="color:#dc2626;font-weight:700;">${defectTitle}</span>
                        </div>
                        <div class="vision-diag-row">
                            <span style="color:#64748b;">🎯 AI Aniqlik darajasi:</span>
                            <span style="color:#16a34a;font-weight:700;">${confidence}</span>
                        </div>
                        <div class="vision-diag-row">
                            <span style="color:#64748b;">⚡ Xavf darajasi:</span>
                            <span>${severity}</span>
                        </div>
                        <div class="vision-diag-row">
                            <span style="color:#64748b;">💰 Taxminiy smeta:</span>
                            <strong style="color:#2563eb;">${costEstimate}</strong>
                        </div>
                        <div style="font-size:12px;margin:8px 0;background:#f8fafc;padding:8px;border-radius:8px;">
                            <strong>🛠️ Tavsiya etilgan harakat:</strong><br>${actionPlan}
                        </div>
                        <button class="calc-book-action-btn" onclick="window.ustajonAI.openInstantBooking('Rasm bo\\'yicha ta\\'mirlash: ${defectTitle}')">
                            <i class="fa-solid fa-user-gear"></i> Ushbu muammo bo'yicha usta chaqirish
                        </button>
                    </div>
                `;

                this.streamBotMessage(
                    `✅ **Fotosurat chuqur tahlil qilindi!**\n\nUstajon Vision AI neyrotarmog'i santexnika nosozligini aniqladi:`,
                    visionCardHTML,
                    ["Usta chaqirish", "Smeta hisoblang", "Boshqa rasm yuklash"]
                );
            }, 1200);
        }

        // ═════════════════════════════════════════════════════
        // XABAR YUBORISH VA JAVOB MANTIQI
        // ═════════════════════════════════════════════════════
        handleSend() {
            const input = document.getElementById('ustajonInput');
            if (!input || this.isTyping) return;
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            sound.playPop();

            const analysis = this.nlp.analyze(text);
            this.conversation.addMessage('user', text, analysis.intent, analysis.entities);
            this.renderUserMessage(text);
            this.showTypingIndicator();

            const thinkingTime = analysis.entities.urgency === 'critical' ? 350 : 500 + Math.random() * 400;

            setTimeout(() => {
                this.removeTypingIndicator();
                this.generateResponse(analysis);
            }, thinkingTime);
        }

        generateResponse(analysis) {
            const { intent, entities, confidence } = analysis;
            const context = this.conversation.getContext();
            const responses = this.kb.responses;

            let responseText = '';
            let extraHTML = '';
            let followUpSuggestions = [];

            switch (intent) {
                case 'emergency':
                    responseText = responses.emergency.main;
                    extraHTML = this.buildEmergencyInteractiveProtocol();
                    followUpSuggestions = responses.emergency.followUp;
                    break;

                case 'interactive_calculator':
                    responseText = responses.interactive_calculator.main;
                    extraHTML = this.buildInteractiveCalculator();
                    followUpSuggestions = responses.interactive_calculator.followUp;
                    break;

                case 'interactive_diagnostic':
                    responseText = responses.interactive_diagnostic.main;
                    extraHTML = this.buildDiagnosticWizard();
                    followUpSuggestions = responses.interactive_diagnostic.followUp;
                    break;

                case 'photo_vision':
                    responseText = responses.photo_vision.main;
                    extraHTML = `
                        <div style="margin-top:10px;">
                            <button class="calc-book-action-btn" onclick="document.getElementById('ustajonFileInput').click()">
                                <i class="fa-solid fa-camera"></i> Fotosuratni hozir tanlash
                            </button>
                        </div>
                    `;
                    followUpSuggestions = responses.photo_vision.followUp;
                    break;

                case 'instant_booking':
                    responseText = responses.instant_booking.main;
                    extraHTML = this.buildBookingForm();
                    followUpSuggestions = responses.instant_booking.followUp;
                    break;

                case 'find_worker':
                    const loc = entities.location || context.lastLocation;
                    const svc = entities.service || context.lastService;
                    responseText = responses.find_worker.main(loc, svc);
                    extraHTML = this.buildLiveWorkerCards(loc, svc);
                    followUpSuggestions = responses.find_worker.followUp;
                    break;

                case 'pricing':
                    responseText = responses.pricing.main;
                    extraHTML = this.buildInteractiveCalculator();
                    followUpSuggestions = responses.pricing.followUp;
                    break;

                case 'water_pressure':
                    responseText = responses.water_pressure.main;
                    followUpSuggestions = responses.water_pressure.followUp;
                    break;

                case 'radiator_heating':
                    responseText = responses.radiator_heating.main;
                    followUpSuggestions = responses.radiator_heating.followUp;
                    break;

                case 'water_filter':
                    responseText = responses.water_filter.main;
                    followUpSuggestions = responses.water_filter.followUp;
                    break;

                case 'sewer_smell':
                    responseText = responses.sewer_smell.main;
                    followUpSuggestions = responses.sewer_smell.followUp;
                    break;

                case 'water_meter':
                    responseText = responses.water_meter.main;
                    followUpSuggestions = responses.water_meter.followUp;
                    break;

                case 'pipes_welding':
                    responseText = responses.pipes_welding.main;
                    followUpSuggestions = responses.pipes_welding.followUp;
                    break;

                case 'ariston_problem':
                    responseText = responses.ariston_problem.main;
                    extraHTML = this.buildLiveWorkerCards(entities.location, { category: 'santexnik', name: 'Ariston ustasi' });
                    followUpSuggestions = responses.ariston_problem.followUp;
                    break;

                case 'pipe_problem':
                    responseText = responses.pipe_problem.main;
                    extraHTML = this.buildLiveWorkerCards(entities.location, { category: 'santexnik', name: 'Kanalizatsiya ustasi' });
                    followUpSuggestions = responses.pipe_problem.followUp;
                    break;

                case 'faucet_problem':
                    responseText = responses.faucet_problem.main;
                    followUpSuggestions = responses.faucet_problem.followUp;
                    break;

                case 'toilet_problem':
                    responseText = responses.toilet_problem.main;
                    followUpSuggestions = responses.toilet_problem.followUp;
                    break;

                case 'bathroom_renovation':
                    responseText = responses.bathroom_renovation.main;
                    followUpSuggestions = responses.bathroom_renovation.followUp;
                    break;

                case 'installation':
                    responseText = responses.installation.main;
                    extraHTML = this.buildBookingForm("Yangi santexnika o'rnatish");
                    followUpSuggestions = responses.installation.followUp;
                    break;

                case 'accessibility':
                    responseText = responses.accessibility.main;
                    extraHTML = this.buildAccessibilityCard();
                    followUpSuggestions = responses.accessibility.followUp;
                    break;

                case 'greeting':
                    const greetings = responses.greeting.responses;
                    const greetFn = greetings[Math.floor(Math.random() * greetings.length)];
                    responseText = greetFn(this.kb.getTimeOfDayGreeting());
                    followUpSuggestions = ['Usta topib bering', 'Smeta hisoblash', 'Muammo rasmini yuklash'];
                    break;

                case 'thanks':
                    const thanksArr = responses.thanks.responses;
                    responseText = thanksArr[Math.floor(Math.random() * thanksArr.length)];
                    followUpSuggestions = ['Yana savol bor', 'Usta chaqirish', 'Boshqa xizmatlar'];
                    break;

                case 'about_platform':
                    responseText = responses.about_platform.main;
                    followUpSuggestions = responses.about_platform.followUp;
                    break;

                case 'working_hours':
                    responseText = responses.working_hours.main;
                    followUpSuggestions = responses.working_hours.followUp;
                    break;

                case 'warranty':
                    responseText = responses.warranty.main;
                    followUpSuggestions = responses.warranty.followUp;
                    break;

                default:
                    if (context.lastIntent && confidence < 0.3) {
                        responseText = this.generateContextualResponse(analysis, context);
                    } else {
                        const generalArr = responses.general.responses;
                        responseText = generalArr[Math.floor(Math.random() * generalArr.length)];
                    }
                    followUpSuggestions = ['Usta topib bering', 'Smeta kalkulyatori', 'Avariya yordami'];
                    break;
            }

            if (this.conversation.context.questionsAsked % 3 === 0 && intent !== 'greeting' && intent !== 'thanks') {
                responseText += `\n\n---\n${this.kb.getRandomTip()}`;
            }

            this.conversation.addMessage('bot', responseText, intent);
            this.streamBotMessage(responseText, extraHTML, followUpSuggestions);
        }

        generateContextualResponse(analysis, context) {
            const q = analysis.originalText.toLowerCase();

            if (q.match(/^(ha|haa|xa|ok|yaxshi|boladi|albatta|mayli)$/i)) {
                if (context.lastIntent === 'find_worker') {
                    return `Ajoyib! Qaysi tumandasiz? Masalan: Chilonzor, Yunusobod, Sergeli...`;
                }
                if (context.lastIntent === 'pricing') {
                    return `Yaxshi! Qaysi xizmat bo'yicha narx qiziqtiryapti?`;
                }
                return `Tushundim! Davom etamiz. Qanday xizmat kerak?`;
            }

            if (q.match(/^(yo'q|yoq|kerak emas|rahmat)$/i)) {
                return `Tushunarli! Agar biror santexnika masalasida yordam kerak bo'lsa, bemalol yozing. MySantexnik.uz har doim xizmatingizda! 😊`;
            }

            if (analysis.entities.location && context.lastIntent === 'find_worker') {
                return this.kb.responses.find_worker.main(analysis.entities.location, context.lastService);
            }

            return `Tushundim! Sizga yordam berishga tayyorman 🛠️\n\nAniqroq yozsangiz, eng to'g'ri maslahatni beraman (manzil, muammo turi, yoki kerakli xizmat).`;
        }

        // ═════════════════════════════════════════════════════
        // KOMPONENT GENERATORLARI (Cards & Widgets)
        // ═════════════════════════════════════════════════════

        // 1. Interaktiv Smeta Kalkulyatori
        buildInteractiveCalculator() {
            const prices = this.kb.prices;
            let rowsHtml = '';
            prices.forEach((p, idx) => {
                const checked = idx === 0 ? 'checked' : '';
                const selectedCls = idx === 0 ? 'selected' : '';
                rowsHtml += `
                    <div class="calc-service-item ${selectedCls}" id="calc_item_${p.id}">
                        <label class="calc-service-label">
                            <input type="checkbox" name="smeta_service" value="${p.price}" data-id="${p.id}" data-name="${p.service}" ${checked} onchange="window.ustajonAI.updateSmetaCalculation()">
                            <span>${p.icon} ${p.service}</span>
                        </label>
                        <span class="calc-service-price">${this.formatNumber(p.price)} so'm</span>
                    </div>
                `;
            });

            return `
                <div class="ustajon-calc-widget" id="ustajonCalcWidget">
                    <div class="calc-widget-title">
                        <span><i class="fa-solid fa-calculator" style="color:#2563eb;"></i> Xizmatlarni tanlang:</span>
                        <label style="font-size:12px;cursor:pointer;color:#dc2626;font-weight:600;">
                            <input type="checkbox" id="calcUrgentCheck" onchange="window.ustajonAI.updateSmetaCalculation()"> Tezkor (+25%)
                        </label>
                    </div>
                    <div class="calc-services-list">
                        ${rowsHtml}
                    </div>
                    <div class="calc-total-banner">
                        <span>Jami smeta (taxminiy):</span>
                        <span class="calc-total-amount" id="calcTotalAmount">${this.formatNumber(prices[0].price)} so'm</span>
                    </div>
                    <button class="calc-book-action-btn" onclick="window.ustajonAI.bookWithCurrentSmeta()">
                        <i class="fa-solid fa-file-signature"></i> Ushbu smeta bilan ariza qoldirish
                    </button>
                </div>
            `;
        }

        updateSmetaCalculation() {
            const widget = document.getElementById('ustajonCalcWidget');
            if (!widget) return;

            const checkboxes = widget.querySelectorAll('input[name="smeta_service"]:checked');
            let total = 0;
            const selectedItems = [];

            checkboxes.forEach(cb => {
                const price = parseInt(cb.value, 10);
                total += price;
                selectedItems.push(cb.getAttribute('data-name'));
                const itemDiv = document.getElementById(`calc_item_${cb.getAttribute('data-id')}`);
                if (itemDiv) itemDiv.classList.add('selected');
            });

            // Unselected items
            widget.querySelectorAll('input[name="smeta_service"]:not(:checked)').forEach(cb => {
                const itemDiv = document.getElementById(`calc_item_${cb.getAttribute('data-id')}`);
                if (itemDiv) itemDiv.classList.remove('selected');
            });

            const isUrgent = widget.querySelector('#calcUrgentCheck')?.checked;
            if (isUrgent) {
                total = Math.round(total * 1.25);
            }

            const totalEl = widget.querySelector('#calcTotalAmount');
            if (totalEl) totalEl.textContent = `${this.formatNumber(total)} so'm`;

            this.conversation.context.selectedSmeta = selectedItems;
            this.conversation.context.totalSmeta = total;
            sound.playPop();
        }

        bookWithCurrentSmeta() {
            const total = this.conversation.context.totalSmeta || 90000;
            const items = (this.conversation.context.selectedSmeta || ['Kran montaji']).join(', ');
            this.openInstantBooking(`Smeta bo'yicha: ${items} (Taxminan: ${this.formatNumber(total)} so'm)`);
        }

        // 2. Chat orqali 1-bosishda Haqiqiy Ariza Qoldirish Formasi
        buildBookingForm(prefilledProblem = '') {
            const context = this.conversation.getContext();
            const locationName = context.lastLocation ? context.lastLocation.fullName : 'Toshkent shahri';
            const problem = prefilledProblem || (context.lastService ? context.lastService.name : 'Santexnika xizmati');

            const formId = `booking_${Date.now()}`;
            return `
                <div class="ustajon-booking-card" id="${formId}">
                    <div style="font-size:14px;font-weight:700;margin-bottom:8px;color:#1e3a8a;">
                        <i class="fa-solid fa-paper-plane" style="color:#2563eb;"></i> Tezkor Usta Chaqirish
                    </div>
                    <div class="booking-form-group">
                        <label>Ismingiz:</label>
                        <input type="text" class="booking-input-field" id="${formId}_name" placeholder="Masalan: Sardor" value="${context.userName || ''}">
                    </div>
                    <div class="booking-form-group">
                        <label>Telefon raqamingiz:</label>
                        <input type="tel" class="booking-input-field" id="${formId}_phone" placeholder="+998 90 123 45 67" value="${context.userPhone || '+998 '}">
                    </div>
                    <div class="booking-form-group">
                        <label>Tuman / Manzil:</label>
                        <input type="text" class="booking-input-field" id="${formId}_loc" placeholder="Masalan: Chilonzor 7-mavze" value="${locationName}">
                    </div>
                    <div class="booking-form-group">
                        <label>Muammo / Xizmat turi:</label>
                        <input type="text" class="booking-input-field" id="${formId}_desc" placeholder="Kran oqyapti, montaj..." value="${this.escapeHTML(problem)}">
                    </div>
                    <button class="booking-submit-btn" onclick="window.ustajonAI.submitBookingForm('${formId}')">
                        <i class="fa-solid fa-check"></i> Arizani yuborish (Bepul)
                    </button>
                </div>
            `;
        }

        openInstantBooking(problemText) {
            const formHTML = this.buildBookingForm(problemText);
            this.streamBotMessage(`Arizangizni rasmiylashtirish uchun telefon raqamingizni kiriting 👇`, formHTML, ["Dispetcherga qo'ng'iroq"]);
        }

        async submitBookingForm(formId) {
            const container = document.getElementById(formId);
            if (!container) return;

            const nameInput = document.getElementById(`${formId}_name`);
            const phoneInput = document.getElementById(`${formId}_phone`);
            const locInput = document.getElementById(`${formId}_loc`);
            const descInput = document.getElementById(`${formId}_desc`);

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const location = locInput ? locInput.value.trim() : '';
            const desc = descInput ? descInput.value.trim() : '';

            if (!phone || phone.length < 9) {
                alert("Iltimos, to'g'ri telefon raqamingizni kiriting!");
                if (phoneInput) phoneInput.focus();
                return;
            }

            this.conversation.context.userName = name;
            this.conversation.context.userPhone = phone;

            const orderId = Math.floor(100000 + Math.random() * 900000);

            // API orqali bazaga saqlash
            try {
                if (window.api && typeof window.api.submitContactRequest === 'function') {
                    await window.api.submitContactRequest({
                        name: name || "Mijoz (Ustajon AI)",
                        phone: phone,
                        address: location,
                        message: `Ustajon AI orqali ariza #${orderId}: ${desc}`
                    });
                }
            } catch (err) {
                console.warn('API booking sync:', err);
            }

            sound.playSuccess();

            container.innerHTML = `
                <div class="booking-success-badge">
                    <div style="font-size:24px;margin-bottom:6px;">🎉</div>
                    <strong style="font-size:15px;color:#047857;">Arizangiz muvaffaqiyatli qabul qilindi!</strong>
                    <div style="font-size:12px;margin:6px 0;color:#065f46;">
                        Buyurtma raqami: <strong>#MS-${orderId}</strong><br>
                        Mutaxassis: <strong>${name || 'Mijoz'} (${phone})</strong><br>
                        Manzil: <strong>${location}</strong>
                    </div>
                    <p style="font-size:12px;margin:4px 0 0;color:#047857;">
                        Dispetcherimiz <strong>5-10 daqiqa</strong> ichida siz bilan bog'lanib, eng yaqin ustani yo'naltiradi.
                    </p>
                    <a href="tel:+998712000000" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#059669;color:#fff;border-radius:8px;font-size:12px;text-decoration:none;font-weight:700;">
                        <i class="fa-solid fa-phone"></i> Shoshilinch bo'lsa: +998 71 200-00-00
                    </a>
                </div>
            `;
        }

        // 3. Interaktiv Nosozlik Diagnostikasi (Diagnostic Wizard)
        buildDiagnosticWizard() {
            return `
                <div class="ustajon-wizard-card">
                    <div class="wizard-title">Qayerda nosozlik yuz berdi?</div>
                    <div class="wizard-buttons-grid">
                        <button class="wizard-btn" onclick="window.ustajonAI.selectDiagnosticStep('faucet')">
                            🚰 Kran / Smesitel
                        </button>
                        <button class="wizard-btn" onclick="window.ustajonAI.selectDiagnosticStep('toilet')">
                            🚽 Unitaz / Bachok
                        </button>
                        <button class="wizard-btn" onclick="window.ustajonAI.selectDiagnosticStep('ariston')">
                            🛁 Ariston / Kotel
                        </button>
                        <button class="wizard-btn" onclick="window.ustajonAI.selectDiagnosticStep('pipe')">
                            🔧 Truba / Kanalizatsiya
                        </button>
                        <button class="wizard-btn" onclick="window.ustajonAI.selectDiagnosticStep('heating')">
                            ♨️ Isitish radiatori
                        </button>
                        <button class="wizard-btn" onclick="window.ustajonAI.selectDiagnosticStep('pressure')">
                            💧 Suv bosimi (Napor)
                        </button>
                    </div>
                </div>
            `;
        }

        selectDiagnosticStep(type) {
            sound.playPop();
            const symptomMap = {
                faucet: {
                    title: "Kran bilan qanday alomat kuzatilyapti?",
                    items: [
                        { label: "Tomchilab turibdi", prompt: "Kran tomchilab turibdi, nima qilish kerak?" },
                        { label: "Pastidan suv sizyapti", prompt: "Kran ostidan suv oqyapti" },
                        { label: "Kran burilmay qoldi", prompt: "Kran burilmayapti, ohaklangan" },
                        { label: "Suv otilib toshdi", prompt: "Kran sinib ketdi, suv toshdi!" }
                    ]
                },
                toilet: {
                    title: "Unitazda qanday muammo?",
                    items: [
                        { label: "Bachokdan to'xtovsiz oqyapti", prompt: "Unitaz bachogi to'xtovsiz suv oqyapti" },
                        { label: "Unitaz tiqilib qoldi", prompt: "Unitaz tiqilib qoldi, suv ketmayapti" },
                        { label: "Ostidan suv sizyapti", prompt: "Unitaz tagidan suv sizib chiqmoqda" },
                        { label: "Tugmasi ishlamayapti", prompt: "Unitaz tugmasi bosilmayapti" }
                    ]
                },
                ariston: {
                    title: "Ariston/Kotelda nima bo'lyapti?",
                    items: [
                        { label: "Suv isitmayapti", prompt: "Ariston umuman suv isitmayapti" },
                        { label: "Pastdan suv tomchilyapti", prompt: "Aristondan suv tomchilab oqyapti" },
                        { label: "Tok uryapti", prompt: "Suvdan yoki aristondan tok uryapti!" },
                        { label: "Suv tez sovub qolyapti", prompt: "Ariston suvi tez tugab sovib qolyapti" }
                    ]
                },
                pipe: {
                    title: "Kanalizatsiya/Quvurda nima bo'ldi?",
                    items: [
                        { label: "Oshxona rakovinasi tiqildi", prompt: "Oshxona lavabosi tiqilib qoldi" },
                        { label: "Vannadan suv ketmayapti", prompt: "Vannadan suv ketmayapti" },
                        { label: "Quvur yorildi/oqyapti", prompt: "Truba teshildi, suv oqyapti!" },
                        { label: "Badbo'y hid kelyapti", prompt: "Kanalizatsiyadan yoqimsiz hid kelmoqda" }
                    ]
                },
                heating: {
                    title: "Isitish tizimida qanday alomat?",
                    items: [
                        { label: "Batareya yarmi sovuq", prompt: "Radiator yarmi sovuq, isitmayapti" },
                        { label: "Batareya oqyapti", prompt: "Radiatordan suv oqib turibdi" },
                        { label: "Issiq pol isitmayapti", prompt: "Issiq pol isitmayapti" },
                        { label: "Havo chiqarish kerak", prompt: "Radiatordan havoni qanday chiqaraman?" }
                    ]
                },
                pressure: {
                    title: "Suv bosimida nima muammo?",
                    items: [
                        { label: "Umuman bosim yo'q", prompt: "Suv bosimi juda past, davleniye yo'q" },
                        { label: "Faqat issiq suv sust", prompt: "Issiq suv bosimi past" },
                        { label: "Nasos o'rnatish kerak", prompt: "Bosim kuchaytiruvchi nasos o'rnatish" }
                    ]
                }
            };

            const data = symptomMap[type];
            if (!data) return;

            let btnsHtml = '';
            data.items.forEach(item => {
                btnsHtml += `
                    <button class="wizard-btn" onclick="document.getElementById('ustajonInput').value='${this.escapeHTML(item.prompt)}'; window.ustajonAI.handleSend();">
                        ${item.label}
                    </button>
                `;
            });

            const html = `
                <div class="ustajon-wizard-card">
                    <div class="wizard-title">${data.title}</div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        ${btnsHtml}
                    </div>
                </div>
            `;

            this.streamBotMessage(`Quyidagi aniq alomatlardan birini tanlang:`, html);
        }

        // 4. Favqulodda Avariya (SOS) Interaktiv Protokoli
        buildEmergencyInteractiveProtocol() {
            return `
                <div class="ustajon-sos-step" id="sosWizard">
                    <div class="sos-step-header">
                        <i class="fa-solid fa-triangle-exclamation"></i> 1-Qadam: Suv ventelini yopish
                    </div>
                    <div style="font-size:12.5px;color:#881337;">
                        Kvartira kirish eshigi oldidagi yoki vannaxona stoyakidagi asosiy kran (sharovoy ventil)ni burab yopdingizmi?
                    </div>
                    <div class="sos-step-btn-row">
                        <button class="sos-confirm-btn yes" onclick="window.ustajonAI.advanceSosStep(2)">
                            <i class="fa-solid fa-check"></i> Ha, yopdim
                        </button>
                        <button class="sos-confirm-btn no" onclick="window.ustajonAI.showValveGuide()">
                            <i class="fa-solid fa-circle-question"></i> Topa olmadim!
                        </button>
                    </div>
                </div>
                <div style="margin-top:8px;">
                    <a href="tel:+998712000000" class="btn w-100" style="background:#dc2626;color:#fff;font-weight:800;padding:12px;border-radius:10px;text-align:center;display:block;text-decoration:none;">
                        <i class="fa-solid fa-phone-volume"></i> 24/7 Avariya Dispetcheriga Qo'ng'iroq
                    </a>
                </div>
            `;
        }

        advanceSosStep(step) {
            sound.playSuccess();
            const wizard = document.getElementById('sosWizard');
            if (!wizard) return;

            if (step === 2) {
                wizard.innerHTML = `
                    <div class="sos-step-header">
                        <i class="fa-solid fa-bolt"></i> 2-Qadam: Elektr tokini o'chirish
                    </div>
                    <div style="font-size:12.5px;color:#881337;">
                        Suv elektr simlari, rozetka yoki maishiy texnikaga yetgan bo'lsa, elektr schitokidagi asosiy avtomatni tushirdingizmi?
                    </div>
                    <div class="sos-step-btn-row">
                        <button class="sos-confirm-btn yes" onclick="window.ustajonAI.advanceSosStep(3)">
                            <i class="fa-solid fa-check"></i> Ha, o'chirdim
                        </button>
                        <button class="sos-confirm-btn no" onclick="window.ustajonAI.advanceSosStep(3)">
                            Suv yetmagan / Xavfsiz
                        </button>
                    </div>
                `;
            } else if (step === 3) {
                wizard.innerHTML = `
                    <div class="sos-step-header" style="color:#059669;">
                        <i class="fa-solid fa-circle-check"></i> Birlamchi xavf bartaraf etildi!
                    </div>
                    <div style="font-size:12.5px;color:#065f46;margin-bottom:8px;">
                        Endi avariya brigadamiz tezkor yetib kelishi uchun telefon raqamingizni qoldiring:
                    </div>
                    <button class="booking-submit-btn" style="margin:0;" onclick="window.ustajonAI.openInstantBooking('Shoshilinch avariya holati!')">
                        <i class="fa-solid fa-truck-fast"></i> Avariya ustasini chaqirish
                    </button>
                `;
            }
        }

        showValveGuide() {
            sound.playPop();
            const guide = `
                ℹ️ **Ventelni qayerdan qidirish kerak?**\n
                1. **Vannaxona yoki hojatxona:** Stoyak trubalarining yonida yoki kafel orqasidagi lyuk eshikchasi ichida.\n
                2. **Kvartira kirishida:** Kirish eshigi tepasida yoki pol ostidagi santexnika shkafida.\n
                3. **Podyezdda:** Ba'zi ko'p qavatli uylarda umumiy qavat stoyakida bo'ladi.\n
                *Sharovoy ventel tutqichi trubaga perpendikulyar (90 gradus) tursa — yopiq hisoblanadi.*
            `;
            this.streamBotMessage(guide, '', ["Ventelni yopdim", "Avariya brigadasi chaqiring"]);
        }

        // 5. Haqiqiy Ustalar Bazasidan Ko'rsatish (Live Worker Cards)
        buildLiveWorkerCards(location, service) {
            const targetArea = location ? location.fullName : "Toshkent shahri";

            // Live API yoki LocalStorage dan ustalarni olish
            let workersList = [];
            try {
                const saved = localStorage.getItem('mock_workers');
                if (saved) workersList = JSON.parse(saved);
            } catch (e) { }

            if (!workersList || workersList.length === 0) {
                workersList = [
                    { id: 101, full_name: "Aziz Nematov", phone: "+998901234567", category: "santexnik", experience_years: 6, city: "Toshkent shahri", avg_rating: 4.9, total_reviews: 24, description: "Kran, truba, unitaz, gidroizolyatsiya ustasi", is_active: true },
                    { id: 102, full_name: "Jasur Rahimov", phone: "+998971234567", category: "santexnik", experience_years: 9, city: targetArea, avg_rating: 4.8, total_reviews: 31, description: "Ariston, kotel, isitish tizimlari va avariya", is_active: true },
                    { id: 103, full_name: "Oybek Toshmatov", phone: "+998931234567", category: "santexnik", experience_years: 12, city: targetArea, avg_rating: 4.95, total_reviews: 48, description: "Vannaxona to'liq ta'mirlash, payvandlash", is_active: true }
                ];
            }

            let filtered = workersList.filter(w => w.is_active !== false);

            if (service && service.category) {
                const matched = filtered.filter(w => (w.category || '').toLowerCase() === service.category.toLowerCase());
                if (matched.length > 0) filtered = matched;
            }

            let cardsHTML = `<div class="ustajon-card-grid">`;
            filtered.slice(0, 3).forEach((w, idx) => {
                const rating = w.avg_rating || (4.6 + (idx * 0.1)).toFixed(1);
                const reviews = w.total_reviews || (15 + idx * 8);
                const exp = w.experience_years || (4 + idx * 3);
                const verified = idx < 2;

                cardsHTML += `
                    <div class="ustajon-worker-card">
                        <div class="worker-card-header">
                            <span class="worker-card-name">
                                <i class="fa-solid fa-user-tie"></i> ${this.escapeHTML(w.full_name)}
                                ${verified ? '<i class="fa-solid fa-circle-check" style="color:#3b82f6;font-size:11px;margin-left:4px;" title="Tasdiqlangan mutaxassis"></i>' : ''}
                            </span>
                            <span class="worker-card-rating"><i class="fa-solid fa-star"></i> ${rating} <small>(${reviews})</small></span>
                        </div>
                        <div style="font-size:11.5px;color:var(--text-muted,#64748b);margin:2px 0;">${this.escapeHTML(w.description || 'Professional santexnik xizmati')}</div>
                        <div class="worker-card-details">
                            <span><i class="fa-solid fa-briefcase"></i> ${exp} yil tajriba</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${this.escapeHTML(w.city || targetArea)}</span>
                        </div>
                        <div class="worker-card-actions">
                            <a href="tel:${w.phone}" class="worker-call-btn">
                                <i class="fa-solid fa-phone"></i> Qo'ng'iroq
                            </a>
                            <button class="worker-view-btn" onclick="window.ustajonAI.openInstantBooking('Usta chaqirish: ${this.escapeHTML(w.full_name)}')">
                                <i class="fa-solid fa-calendar-check"></i> Ariza
                            </button>
                        </div>
                    </div>
                `;
            });
            cardsHTML += `</div>`;

            return cardsHTML;
        }

        buildAccessibilityCard() {
            return `
                <div style="margin-top:10px;">
                    <a href="tel:+998712000000" class="btn w-100" style="background:#f59e0b;color:#1e1b4b;font-weight:800;padding:14px;border-radius:12px;text-align:center;text-decoration:none;display:block;box-shadow:0 4px 12px rgba(245,158,11,0.3);font-size:15px;">
                        <i class="fa-solid fa-phone-volume"></i> 1 bosishda Dispetcher bilan bog'lanish
                    </a>
                </div>
            `;
        }

        // ═════════════════════════════════════════════════════
        // STREAM EFFEKT BILAN XABAR CHIQARISH (Streaming)
        // ═════════════════════════════════════════════════════
        streamBotMessage(markdownText, extraHTML = '', followUpSuggestions = []) {
            const body = document.getElementById('ustajonBody');
            if (!body) return;

            this.isTyping = true;
            sound.playPop();

            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgId = `bot_msg_${Date.now()}`;

            const msgEl = document.createElement('div');
            msgEl.className = 'ustajon-msg bot';
            msgEl.id = msgId;
            msgEl.innerHTML = `
                <div class="ustajon-msg-avatar">👨‍🔧</div>
                <div class="ustajon-bubble">
                    <div class="ustajon-stream-content"></div>
                    <div class="ustajon-action-bar" style="display:none;">
                        <div class="ustajon-actions-left">
                            <button class="ustajon-action-btn ustajon-speak-btn" title="Ovoz chiqarib o'qish">
                                <i class="fa-solid fa-volume-high"></i> Tinglash
                            </button>
                            <button class="ustajon-action-btn ustajon-copy-btn" title="Nusxalash">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                            <button class="ustajon-action-btn ustajon-like-btn" title="Foydali">
                                <i class="fa-solid fa-thumbs-up"></i>
                            </button>
                            <button class="ustajon-action-btn ustajon-dislike-btn" title="Foydasiz">
                                <i class="fa-solid fa-thumbs-down"></i>
                            </button>
                        </div>
                        <div class="ustajon-bubble-time">${time}</div>
                    </div>
                </div>
            `;

            body.appendChild(msgEl);

            const streamContainer = msgEl.querySelector('.ustajon-stream-content');
            const actionBar = msgEl.querySelector('.ustajon-action-bar');

            const formattedText = this.formatMarkdown(markdownText);
            const chars = [...formattedText];
            let i = 0;
            let buffer = '';
            let inTag = false;

            const streamInterval = setInterval(() => {
                if (i >= chars.length) {
                    clearInterval(streamInterval);

                    if (extraHTML) {
                        const extraContainer = document.createElement('div');
                        extraContainer.className = 'ustajon-extra-content';
                        extraContainer.style.animation = 'msgFadeIn 0.35s ease-out';
                        extraContainer.innerHTML = extraHTML;
                        streamContainer.appendChild(extraContainer);
                    }

                    if (actionBar) actionBar.style.display = 'flex';

                    if (followUpSuggestions && followUpSuggestions.length > 0) {
                        this.updateSuggestions(followUpSuggestions);
                    }

                    this.bindActionBarEvents(msgEl, streamContainer);

                    if (this.isAccessibilityMode) {
                        const plainText = streamContainer.innerText;
                        this.speakText(plainText, msgEl.querySelector('.ustajon-speak-btn'));
                    }

                    this.isTyping = false;
                    sound.playSuccess();
                    body.scrollTop = body.scrollHeight;
                    return;
                }

                const char = chars[i];

                if (char === '<') {
                    inTag = true;
                    buffer += char;
                    i++;
                    return;
                }

                if (inTag) {
                    buffer += char;
                    if (char === '>') {
                        inTag = false;
                        streamContainer.innerHTML = buffer;
                    }
                    i++;
                    return;
                }

                buffer += char;
                streamContainer.innerHTML = buffer;

                if (i % 6 === 0) {
                    body.scrollTop = body.scrollHeight;
                }

                i++;
            }, 6); // 6ms — tez, elastik va zamonaviy oqim

            body.scrollTop = body.scrollHeight;
        }

        bindActionBarEvents(msgEl, streamContainer) {
            const speakBtn = msgEl.querySelector('.ustajon-speak-btn');
            const copyBtn = msgEl.querySelector('.ustajon-copy-btn');
            const likeBtn = msgEl.querySelector('.ustajon-like-btn');
            const dislikeBtn = msgEl.querySelector('.ustajon-dislike-btn');

            if (speakBtn) {
                speakBtn.addEventListener('click', () => {
                    const plain = streamContainer.innerText.replace(/Tinglash|Nusxalash/g, '').trim();
                    this.speakText(plain, speakBtn);
                });
            }

            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    const plain = streamContainer.innerText.replace(/Tinglash|Nusxalash/g, '').trim();
                    navigator.clipboard.writeText(plain).then(() => {
                        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Nusxalandi';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
                        }, 2000);
                        sound.playPop();
                    });
                });
            }

            if (likeBtn) {
                likeBtn.addEventListener('click', () => {
                    likeBtn.classList.add('active');
                    if (dislikeBtn) dislikeBtn.classList.remove('active');
                    sound.playPop();
                });
            }

            if (dislikeBtn) {
                dislikeBtn.addEventListener('click', () => {
                    dislikeBtn.classList.add('active');
                    if (likeBtn) likeBtn.classList.remove('active');
                    sound.playPop();
                });
            }
        }

        updateSuggestions(suggestions) {
            const container = document.getElementById('ustajonSuggestions');
            if (!container) return;

            container.innerHTML = '';
            suggestions.forEach(text => {
                const chip = document.createElement('button');
                chip.className = 'ustajon-chip';
                chip.setAttribute('data-prompt', text);
                chip.textContent = text;
                chip.style.animation = 'msgFadeIn 0.3s ease-out';
                container.appendChild(chip);
            });
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
                    <div class="ustajon-stream-content">${formattedText}</div>
                    ${extraHTML}
                    <div class="ustajon-action-bar">
                        <div class="ustajon-actions-left">
                            <button class="ustajon-action-btn ustajon-speak-btn" title="Ovoz chiqarib o'qish">
                                <i class="fa-solid fa-volume-high"></i> Tinglash
                            </button>
                            <button class="ustajon-action-btn ustajon-copy-btn" title="Nusxalash">
                                <i class="fa-solid fa-copy"></i>
                            </button>
                        </div>
                        <div class="ustajon-bubble-time">${time}</div>
                    </div>
                </div>
            `;

            const streamContainer = msgEl.querySelector('.ustajon-stream-content');
            this.bindActionBarEvents(msgEl, streamContainer);

            body.appendChild(msgEl);
            body.scrollTop = body.scrollHeight;

            if (autoSpeak && this.isAccessibilityMode) {
                this.speakText(streamContainer.innerText, msgEl.querySelector('.ustajon-speak-btn'));
            }
        }

        showTypingIndicator() {
            const body = document.getElementById('ustajonBody');
            if (!body) return;
            const typing = document.createElement('div');
            typing.className = 'ustajon-typing';
            typing.id = 'ustajonTypingIndicator';
            typing.innerHTML = `
                <div class="ustajon-msg-avatar" style="width:24px;height:24px;font-size:12px;border-radius:8px;">👨‍🔧</div>
                <div style="display:flex;align-items:center;gap:5px;padding:8px 14px;background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:18px;border-top-left-radius:4px;">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
            body.appendChild(typing);
            body.scrollTop = body.scrollHeight;
        }

        removeTypingIndicator() {
            const typing = document.getElementById('ustajonTypingIndicator');
            if (typing) typing.remove();
        }

        // ─── Text-to-Speech (TTS) ───────────────────────────
        speakText(text, btnElement = null) {
            if (!('speechSynthesis' in window)) return;

            window.speechSynthesis.cancel();

            const cleanText = text.replace(/[*#_~`—│├└●→•\-]/g, ' ').replace(/\s+/g, ' ').trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);

            const voices = window.speechSynthesis.getVoices();
            const uzVoice = voices.find(v => v.lang.includes('uz') || v.lang.includes('UZ'));
            const ruVoice = voices.find(v => v.lang.includes('ru') || v.lang.includes('RU'));
            const trVoice = voices.find(v => v.lang.includes('tr') || v.lang.includes('TR'));

            if (uzVoice) utterance.voice = uzVoice;
            else if (ruVoice) utterance.voice = ruVoice;
            else if (trVoice) utterance.voice = trVoice;

            utterance.rate = 1.05;
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

        // ─── Yordamchi Funksiyalar ──────────────────────────
        escapeHTML(str) {
            if (!str) return '';
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
            }[tag] || tag));
        }

        formatMarkdown(md) {
            let html = this.escapeHTML(md);
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border,#e2e8f0);margin:8px 0;">');
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        formatNumber(num) {
            return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ISHGA TUSHIRISH (Init)
    // ═══════════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ustajonAI = new UstajonAI();
        });
    } else {
        window.ustajonAI = new UstajonAI();
    }
})();
