/**
 * Ustajon AI — MySantexnik.uz ning Aqlli Yordamchisi (v4.0 — Professional Edition)
 * ============================================================================
 * Xususiyatlari:
 * - 🧠 NLP-asosiy intent aniqlash (Intent Classification)
 * - 🔍 Entity extraction (joy, xizmat, muammo turi)
 * - 💬 Suhbat konteksti va xotira (Conversation Memory)
 * - ⌨️ Stream effekt (harf-harf chiqish)
 * - 🗣️ Ovozli tanish (Speech-to-Text) va ovoz chiqarish (TTS)
 * - ♿ Ko'zi ojizlar uchun Accessibility rejimi
 * - 📊 Interaktiv Smeta Kalkulyatori
 * - 👷 Haqiqiy ustalar bazasi bilan integratsiya
 * - 🚨 Shoshilinch avariya (SOS) rejimi
 * - 🎯 Kontekstga mos tezkor takliflar
 * - 🔊 Web Audio ovoz effektlari
 * ============================================================================
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // 1. OVOZ EFFEKTLARI (Web Audio API — tashqi fayl talab qilmaydi)
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
    // 2. NLP DVIGATEL — Intent Classification va Entity Extraction
    // ═══════════════════════════════════════════════════════════════
    class NLPEngine {
        constructor() {
            // Intent naqshlari — har biri og'irlik bilan
            this.intentPatterns = {
                emergency: {
                    keywords: ['suv tosh', 'suv oq', 'avariya', 'truba yoril', 'toshdi', 'toshib', 'portlab', 'suv bos', 'suv ur', 'suv kel', 'suv chiq', 'teshil', 'buzil', 'sinib', 'yorilib', 'oqib ket', 'oqyapti', 'toshyapti', 'qoplab', 'suv quyil', 'favqulodda', 'shoshilinch', 'tez yor', 'tezkor'],
                    weight: 10,
                    description: 'Shoshilinch avariya holati'
                },
                find_worker: {
                    keywords: ['usta top', 'usta ber', 'usta ker', 'usta chaq', 'usta bor', 'usta yub', 'santexnik top', 'santexnik ber', 'santexnik ker', 'santexnik chaq', 'chaqir', 'topib ber', 'yubor', 'kerak edi', 'kerak', 'ustani', 'masterini', 'master top', 'master ber', 'mutaxassis', 'usta jonat', 'usta kelt'],
                    weight: 8,
                    description: 'Usta qidirish'
                },
                pricing: {
                    keywords: ['narx', 'smeta', 'qancha', 'turadi', 'hisobla', 'baho', 'pul', 'summa', 'arzon', 'qimmat', "to'la", 'byudjet', 'kalkulyator', 'hisob', 'xarajat', "so'm", 'dollar', 'chegirma', 'skidka', 'aksiya'],
                    weight: 7,
                    description: 'Narx va smeta hisoblash'
                },
                ariston_problem: {
                    keywords: ['ariston', 'isitmayapti', 'qizdirmayapti', 'kotyol', 'kotel', 'suv isit', 'boyler', 'boiler', 'issiq suv', 'isitgich', 'goryachiy', 'gaz kolon', 'gazkolonka', 'titanium', 'elektr isit'],
                    weight: 7,
                    description: 'Suv isitgich/Ariston muammosi'
                },
                pipe_problem: {
                    keywords: ['truba', 'quvur', 'kanalizatsiya', "tiqil", 'tiqilib', 'tiqilish', "cho'kindi", 'kanalizatsiy', 'drenaj', 'oqova', 'lavabo', 'rakovina', 'sifon', 'unitaz tiq', 'hojatxona tiq'],
                    weight: 7,
                    description: 'Truba/Kanalizatsiya muammosi'
                },
                faucet_problem: {
                    keywords: ['kran', 'smesitel', 'jo\'mrak', 'tomchi', 'tomchil', 'oqib tur', 'suvchi', 'vanna kran', 'oshxona kran', 'kran oq', 'kran buz', 'kran alm', 'ventil', 'sharovoy', 'buksa'],
                    weight: 7,
                    description: 'Kran/Jo\'mrak muammosi'
                },
                toilet_problem: {
                    keywords: ['unitaz', 'hojatxona', 'tualet', 'bachok', 'slivnoy', 'unitaz oq', 'unitaz buz', 'unitaz alm', 'bide', 'installyatsiya'],
                    weight: 7,
                    description: 'Unitaz muammosi'
                },
                installation: {
                    keywords: ["o'rnat", 'montaj', 'ulash', 'podklyuch', 'ustanovka', "o'rnash", 'qo\'yish', 'yasash', 'qurilish', 'remont', "ta'mir"],
                    weight: 6,
                    description: "O'rnatish/Montaj xizmati"
                },
                accessibility: {
                    keywords: ["ko'zi ojiz", 'kozi ojiz', 'nogiron', 'imkoniyati cheklan', 'nogironlik', "ko'r", 'ko\'rlik', 'maxsus ehtiyoj', 'ovozli yordam', 'ovozli xizmat', 'ovozli reji'],
                    weight: 6,
                    description: 'Imkoniyati cheklangan shaxslar uchun yordam'
                },
                greeting: {
                    keywords: ['salom', 'assalomu', 'hayrli', 'xayrli', 'hello', 'hi', 'hey', 'privet', 'zdra', 'good', 'kechqurun', 'tun', 'ertalab'],
                    weight: 3,
                    description: 'Salomlashish'
                },
                thanks: {
                    keywords: ['rahmat', 'raxmat', 'tashakkur', 'minnatdor', 'sag bol', "sag' bo'l", 'spasibo', 'thanks', 'yaxshi', 'ajoyib', 'zo\'r', 'super', 'barakalla'],
                    weight: 3,
                    description: 'Minnatdorchilik'
                },
                about_platform: {
                    keywords: ['mysantexnik', 'santexnik.uz', 'platforma', 'sayt', 'ilova', 'dastur', 'kompaniya', 'tashkilot', 'biz haqimizda', 'nima bu', 'qanday ishla', 'nima uchun', 'afzallik', 'ustunlik'],
                    weight: 5,
                    description: 'Platforma haqida'
                },
                working_hours: {
                    keywords: ['soat', 'vaqt', 'ish vaqt', 'qachon', 'nechada', 'ochiq', 'yopiq', 'dam olish', 'bayram', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba', '24/7', 'tungi'],
                    weight: 4,
                    description: 'Ish vaqti haqida'
                },
                warranty: {
                    keywords: ['kafolat', 'garantiya', 'shikoyat', 'norozilik', 'qaytarish', 'sifat', 'yomon', 'buzil', 'qayta', 'takroriy', "ta'mirla"],
                    weight: 5,
                    description: 'Kafolat haqida'
                },
                bathroom_renovation: {
                    keywords: ['vanna', 'hammom', 'dush', 'dush kabin', 'santexnika', 'plitka', 'keramika', 'gidroizolyatsiya', 'hammom remon', 'vanna remon'],
                    weight: 6,
                    description: 'Vannaxona/Hammom ta\'mirlash'
                },
                heating: {
                    keywords: ['isitish', 'otopleniye', 'radiator', 'batareya', 'quvurli pol', 'teplyy pol', 'issiq pol', 'isitish tizim', 'tsentralniy'],
                    weight: 6,
                    description: 'Isitish tizimi'
                },
                water_filter: {
                    keywords: ['filtr', 'suv tozala', 'suv sifat', 'ohak', 'nakip', 'tuz', 'qattiq suv', 'yumshoq suv', 'tozalagich', 'filtratsiya'],
                    weight: 5,
                    description: 'Suv filtrlash'
                }
            };

            // Joylashuv bazasi
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
                    'guliston': 'Guliston',
                    'kokand': "Qo'qon",
                    'marg': "Marg'ilon",
                    'chirchiq': 'Chirchiq',
                    'olmaliq': 'Olmaliq',
                    'angren': 'Angren'
                }
            };

            // Xizmat kategoriyalari
            this.serviceCategories = {
                'santexnik': { name: 'Santexnik', icon: '🔧', keywords: ['santexnik', 'suv', 'truba', 'kran', 'unitaz', 'vanna'] },
                'elektrik': { name: 'Elektrik', icon: '⚡', keywords: ['elektrik', 'tok', 'rozetka', 'simlar', 'avtomat', 'schit'] },
                'konditsioner': { name: 'Konditsioner ustasi', icon: '❄️', keywords: ['konditsioner', 'sovutgich', 'split', 'kondey'] },
                'duradgor': { name: "Duradgor/Yog'ochkash", icon: '🪚', keywords: ['duradgor', 'yog\'och', 'eshik', 'deraza'] },
                'suvaqchi': { name: 'Suvaqchi', icon: '🧱', keywords: ['suvaq', 'shpaklyovka', 'shtukatur'] },
                'plitakash': { name: 'Plitakash', icon: '🔲', keywords: ['plitka', 'kafel', 'keramika', 'keramogranit'] },
                'svarka': { name: 'Svarshik', icon: '🔥', keywords: ['svarka', 'payvandlash', 'metall'] }
            };
        }

        /**
         * Foydalanuvchi xabaridan intent va entitylarni ajratib olish
         */
        analyze(text) {
            const q = text.toLowerCase().replace(/[''`]/g, "'");

            // Intent ballari
            const scores = {};
            for (const [intent, data] of Object.entries(this.intentPatterns)) {
                let score = 0;
                const matchedKeywords = [];
                for (const kw of data.keywords) {
                    if (q.includes(kw)) {
                        score += data.weight;
                        matchedKeywords.push(kw);
                    }
                }
                if (score > 0) {
                    scores[intent] = { score, matchedKeywords };
                }
            }

            // Eng yuqori intentni tanlash
            let bestIntent = 'general';
            let bestScore = 0;
            for (const [intent, data] of Object.entries(scores)) {
                if (data.score > bestScore) {
                    bestScore = data.score;
                    bestIntent = intent;
                }
            }

            // Entitylarni ajratish
            const entities = {
                location: this.extractLocation(q),
                service: this.extractService(q),
                urgency: this.detectUrgency(q),
                sentiment: this.detectSentiment(q)
            };

            return {
                intent: bestIntent,
                confidence: Math.min(bestScore / 15, 1.0),
                entities,
                allIntents: scores,
                originalText: text
            };
        }

        extractLocation(q) {
            // Tumanlarni tekshirish
            for (const [key, data] of Object.entries(this.locations.districts)) {
                if (q.includes(key)) {
                    return { type: 'district', key, ...data };
                }
            }
            // Shaharlarni tekshirish
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
            const urgentWords = ['tez', 'shoshilinch', 'zudlik', 'darrov', 'hozir', 'favqulodda', 'yordam', 'tezda', 'birdaniga', 'toshib', 'portlab', 'sinib', 'avariya'];
            let urgencyScore = 0;
            for (const w of urgentWords) {
                if (q.includes(w)) urgencyScore++;
            }
            // Undov belgilari urgentlikni oshiradi
            const exclamationCount = (q.match(/!/g) || []).length;
            urgencyScore += Math.min(exclamationCount, 3);

            if (urgencyScore >= 3) return 'critical';
            if (urgencyScore >= 1) return 'high';
            return 'normal';
        }

        detectSentiment(q) {
            const positiveWords = ['rahmat', 'raxmat', 'yaxshi', 'ajoyib', "zo'r", 'super', 'barakalla', 'mamnun'];
            const negativeWords = ['yomon', 'noxush', 'achinar', 'dahshat', 'muammo', 'xato', 'buzilgan', 'ishlamayapti'];

            let positive = 0, negative = 0;
            for (const w of positiveWords) { if (q.includes(w)) positive++; }
            for (const w of negativeWords) { if (q.includes(w)) negative++; }

            if (positive > negative) return 'positive';
            if (negative > positive) return 'negative';
            return 'neutral';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. BILIMLAR BAZASI — Keng qamrovli santexnika ma'lumotlar
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
                    main: `🚨 **Diqqat! Favqulodda holat aniqlandi!**\n\nQuyidagi qadamlarni **darhol** bajaring:\n\n**1️⃣ Suv ventelini yoping!**\nKvartiraga kirishdagi asosiy jo'mrakni soat strelkasi bo'yicha burang.\n\n**2️⃣ Elektr tokini o'chiring!**\nAgar suv rozetka yoki simlarga yetgan bo'lsa, schitokdan avtomatni tushiring.\n\n**3️⃣ Qo'shnilaringizga xabar bering!**\nPastki qavatdagilarga ogoh qiling.\n\n**4️⃣ Quyidagi raqamga qo'ng'iroq qiling:**`,
                    followUp: [
                        'Suv ventelini topa olmayapsizmi?',
                        "Qaysi xonadan suv oqyapti?",
                        "Qancha vaqtdan beri oqyapti?"
                    ]
                },

                find_worker: {
                    main: (location, service) => {
                        const area = location ? `**${location.fullName}**` : '**sizning hududingiz**';
                        const svc = service ? `${service.icon} ${service.name}` : 'santexnika';
                        return `Sizga ${area} bo'yicha eng yaxshi ${svc} mutaxassislarini topib beraman! ⭐\n\nQuyidagi ustalarimiz tekshirilgan, reytingli va kafolat bilan ishlaydi:`;
                    },
                    followUp: [
                        "Boshqa tuman yoki shahardagi ustani ko'rsating",
                        "Usta narxlari qancha?",
                        "Bugun kelishi mumkinmi?"
                    ]
                },

                pricing: {
                    main: `💰 **MySantexnik.uz — Xizmat Narxlari**\n\nToshkent shahri bo'yicha 2026-yil holatiga ko'ra o'rtacha bozor narxlari:`,
                    followUp: [
                        "Aniq xizmat turi bo'yicha smeta hisoblang",
                        "Eng arzon ustani ko'rsating",
                        "Kafolat beradimi?"
                    ]
                },

                ariston_problem: {
                    main: `🛁 **Ariston/Suv Isitgich Nosozligi — Diagnostika:**\n\n**1. Elektr ta'minoti:**\n→ Avtomatik o'chgich tushmaganini tekshiring\n→ Termostatni 60-70°C ga sozlang\n→ Indikator chiroq yonayotganini tekshiring\n\n**2. TEN (Isitish elementi) muammosi:**\n→ O'zbekiston suvining qattiqligi sababli TEN ustida ohak (nakip) yig'iladi\n→ Har 1-2 yilda TEN tozalash kerak\n→ TEN almashtirish narxi: 150,000 - 350,000 so'm\n\n**3. Xavfsizlik klapani:**\n→ Pastdan suv oqsa — bosim klapani ishlamayotgan bo'lishi mumkin\n→ Klapan almashtirish: 50,000 - 100,000 so'm\n\n**4. Anod sterjen:**\n→ Korroziyadan himoya qiladi, har 2 yilda almashtiring\n→ Narxi: 30,000 - 80,000 so'm\n\n⚠️ **Muhim:** Elektr toki bilan ehtiyot bo'ling! Professional Ariston ustasini chaqirishni tavsiya qilaman.`,
                    followUp: [
                        "Ariston ustasini chaqirish",
                        "TEN almashtirish narxi",
                        "Yangi Ariston tavsiya qiling"
                    ]
                },

                pipe_problem: {
                    main: `🔧 **Truba/Kanalizatsiya Muammosi — Hal Qilish Yo'llari:**\n\n**Uy sharoitida sinab ko'ring:**\n\n1️⃣ **Qaynoq suv** — Lavaboga 2-3 litr qaynagan suv quying (yog' tiqilishi uchun)\n\n2️⃣ **Soda + Sirka usuli:**\n→ Yarim stakan ichimlik sodasi soling\n→ Ustidan yarim stakan sirka quying\n→ 30 daqiqa kutib, issiq suv bilan yuvib tashlang\n\n3️⃣ **Vantuz** — Lavabo yoki unitazga vantuz bosib tortish\n\n**Bu usullar yordam bermasa:**\n→ Truba ichida qattiq tiqilib qolgan bo'lishi mumkin\n→ Professional uskuna (tros yoki gidrodinamik tozalash) kerak\n→ Usta chaqirish tavsiya etiladi!`,
                    followUp: [
                        "Kanalizatsiya ustasini chaqiring",
                        "Truba tozalash narxi qancha?",
                        "Tiqilish qayta takrorlanmasligi uchun nima qilish kerak?"
                    ]
                },

                faucet_problem: {
                    main: `🚰 **Kran/Jo'mrak Muammosi — Diagnostika:**\n\n**Kran tomchilab tursa:**\n→ Buksa (keramik kartridj) eskirgan — almashtirish kerak\n→ Narxi: 15,000 - 50,000 so'm + ish haqi\n\n**Kran burilmayapti:**\n→ Ohak cho'kgan — sirka bilan tozalash mumkin\n→ Yoki kartridj almashtirilishi kerak\n\n**Kran ostidan suv oqsa:**\n→ Ezish halqasi (prokladka) almashtiring\n→ Yoki smesitelni to'liq almashtiring\n\n**Yangi kran o'rnatish:**\n→ O'rtacha ish haqi: 80,000 - 150,000 so'm\n→ Kran narxi: 100,000 - 1,500,000 so'm (brendga qarab)\n\n💡 **Maslahat:** Arzon xitoy kranlari tez buziladi. Grohe, Hansgrohe, yoki Turkiya ishlab chiqarishi tavsiya etiladi.`,
                    followUp: [
                        "Kran ustasini chaqiring",
                        "Qaysi brendni tavsiya qilasiz?",
                        "Kran va smesitel narxlari"
                    ]
                },

                toilet_problem: {
                    main: `🚽 **Unitaz Muammosi — Diagnostika va Yechim:**\n\n**Unitaz tiqilib qolsa:**\n→ Vantuz bilan bosib-tortib ko'ring\n→ Yordam bermasa — santexnik tros kerak\n→ Usta xizmati: 100,000 - 200,000 so'm\n\n**Bachokdan suv to'xtovsiz oqsa:**\n→ Slivnoy mexanizm buzilgan\n→ Almashtirish: 50,000 - 120,000 so'm\n→ Prokladka almashtirish: 20,000 - 40,000 so'm\n\n**Unitaz ostidan suv sizsa:**\n→ Manshetka (germetik halqa) almashtiring\n→ Silikon germetik bilan qayta muhrlab qo'ying\n\n**Yangi unitaz o'rnatish:**\n→ Ish haqi: 120,000 - 250,000 so'm\n→ Eski unitazni demontaj qilish: 50,000 - 80,000 so'm`,
                    followUp: [
                        "Unitaz ustasini chaqiring",
                        "Yangi unitaz o'rnatish narxi",
                        "Qaysi unitazni tavsiya qilasiz?"
                    ]
                },

                installation: {
                    main: `🔨 **O'rnatish va Montaj Xizmatlari:**\n\nMySantexnik.uz orqali quyidagi xizmatlarni buyurtma qilishingiz mumkin:\n\n• 🚰 **Kran/Smesitel montaji** — 80,000 - 150,000 so'm\n• 🚽 **Unitaz o'rnatish** — 120,000 - 250,000 so'm\n• 🛁 **Vanna/Dush montaji** — 250,000 - 500,000 so'm\n• 🌡️ **Ariston montaji** — 150,000 - 280,000 so'm\n• 🔧 **Truba almashtirish** — metrdan 50,000 - 120,000 so'm\n• 🏠 **To'liq vannaxona remont** — 3,000,000 so'mdan\n\n✅ Barcha ishlar **kafolat** bilan bajariladi\n✅ Sifatsiz ish uchun **bepul qayta ta'mirlash**`,
                    followUp: [
                        "Montaj ustasini chaqiring",
                        "Vannaxona to'liq remont narxi",
                        "Kafolat shartlari nima?"
                    ]
                },

                accessibility: {
                    main: `🤝 **Imkoniyati Cheklangan Yurtdoshlarimiz Uchun:**\n\nMySantexnik.uz platformasida **to'liq ovozli qulaylik** yaratilgan:\n\n🎙️ **Mikrofon** — Ovoz bilan buyurtma bering, yozish shart emas\n🔊 **Karnay tugmasi** — Har bir javob ovoz chiqarib o'qib beriladi\n👁️ **Katta shrift rejimi** — Yozuvlar kattalashtiriladi\n📞 **1 bosishda qo'ng'iroq** — To'g'ridan-to'g'ri operatorga ulanish\n\nShuningdek, **"Ovozli rejim"** tugmasini yoqsangiz, barcha javoblar avtomatik ovoz chiqarib o'qib beriladi.`,
                    followUp: [
                        "Operatorga qo'ng'iroq qilish",
                        "Ovozli rejimni yoqing",
                        "Usta chaqirib bering"
                    ]
                },

                greeting: {
                    responses: [
                        (timeOfDay) => `${timeOfDay} Assalomu alaykum! 👋\n\nMen **Ustajon AI** — MySantexnik.uz ning aqlli yordamchisiman. 👨‍🔧\n\nSizga qanday yordam bera olaman?\n\n• 🔧 Santexnika muammosini hal qilish\n• 👷 Usta topib berish\n• 💰 Narxlarni bilish\n• 🚨 Shoshilinch yordam`,
                        (timeOfDay) => `${timeOfDay}! ✨\n\nMen **Ustajon** — MySantexnik.uz platformasining AI yordamchisi. Santexnika, elektrika va boshqa uy ta'mirlash bo'yicha professional maslahat va usta topib beraman.\n\nQanday savolga javob beraman?`
                    ]
                },

                thanks: {
                    responses: [
                        `Arzimagan! 😊 Sizga yordam bera olganimdan xursandman.\n\nYana biror savol bo'lsa, bemalol yozing. MySantexnik.uz har doim xizmatingizda! 🛠️`,
                        `Sizga ham rahmat! 🙏\n\nAgar kelajakda biror muammo yuzaga kelsa yoki usta kerak bo'lsa — men doim shu yerdaman. MySantexnik.uz — ishonchli yordamchingiz! ✅`,
                        `Xizmat qilganimdan mamnunman! 😊\n\nBizning ustalarimizdan foydalansangiz, iltimos, ish tugagandan so'ng reyting qo'yishni unutmang ⭐ — bu boshqa foydalanuvchilarga ham yordam beradi!`
                    ]
                },

                about_platform: {
                    main: `ℹ️ **MySantexnik.uz — O'zbekistondagi №1 Ustalar Platformasi**\n\n🏆 **Biz haqimizda:**\n→ 500+ tasdiqlangan professional ustalar\n→ Toshkent va barcha viloyatlarda xizmat\n→ Har bir usta tekshirilgan va reytingga ega\n→ Kafolatli va ishonchli xizmat\n\n⚡ **Qanday ishlaydi:**\n1. Muammoingizni yozing yoki ovoz bilan ayting\n2. Biz sizga eng mos ustani topamiz\n3. Usta sizga qo'ng'iroq qiladi va keladi\n4. Ish bajarilgach, reyting qo'ying\n\n💰 **Narxlar:** Platformadan foydalanish **bepul**!\n📞 **Aloqa:** +998 71 200-00-00\n📱 **Telegram:** @Mysantexnik_bot`,
                    followUp: [
                        "Usta topib bering",
                        "Narxlar haqida",
                        "Kafolat shartlari"
                    ]
                },

                working_hours: {
                    main: `🕐 **MySantexnik.uz Ish Vaqti:**\n\n📞 **Dispetcher xizmati:** 24/7 (Dam olish va bayramlarda ham)\n👷 **Ustalar:** Har kuni 08:00 — 22:00\n🚨 **Avariya xizmati:** 24/7 (Qo'shimcha narx bilan)\n💬 **Ustajon AI (Men):** 24/7 har doim online\n\n⏰ **Tungi xizmat (22:00 — 08:00):**\n→ Faqat avariya holatlarda\n→ Narxga 30-50% qo'shimcha to'lov\n→ Yetib borish: 30-60 daqiqa`,
                    followUp: [
                        "Hozir usta chaqirsam keladimi?",
                        "Tungi avariya narxi qancha?",
                        "Yaqin atrofdagi ustani toping"
                    ]
                },

                warranty: {
                    main: `✅ **MySantexnik.uz Kafolat Siyosati:**\n\n🛡️ **Ish kafolati:**\n→ Barcha ishlar **30 kunlik kafolat** bilan bajariladi\n→ Kafolat muddatida nosozlik chiqsa — **bepul** qayta ta'mirlanadi\n→ Ustaning nomalum harakatlari uchun **to'liq javobgarlik** platformada\n\n📋 **Shikoyat tartibi:**\n1. Muammoni Ustajon AI ga yoki dispetcherga xabar bering\n2. Biz 24 soat ichida tekshirib chiqamiz\n3. Ustaga qayta buyurtma beriladi yoki pullik kompensatsiya\n\n⭐ **Reyting tizimi:**\n→ Sifatsiz ish qilgan ustalarning reytingi tushadi\n→ 3.0 dan past reytingli ustalar platformadan chiqariladi\n→ Sizning fikringiz boshqalarga ham yordam beradi!`,
                    followUp: [
                        "Shikoyat bildirmoqchiman",
                        "Ustaga qayta buyurtma bering",
                        "Reyting qo'yish"
                    ]
                },

                bathroom_renovation: {
                    main: `🛁 **Vannaxona/Hammom To'liq Ta'mirlash:**\n\n**O'rtacha narxlar (Toshkent, 2026):**\n\n📐 **Kichik hammom (3-4 m²):**\n→ Demontaj + chiqindi chiqarish: 500,000 so'm\n→ Gidroizolyatsiya: 300,000 - 500,000 so'm\n→ Plitka yotqizish: 1,500,000 - 3,000,000 so'm\n→ Santexnika montaji: 800,000 - 1,500,000 so'm\n→ **Jami:** 3,000,000 - 5,500,000 so'm\n\n📐 **Katta hammom (6-8 m²):**\n→ **Jami:** 5,500,000 - 12,000,000 so'm\n\n💡 **Maslahatlar:**\n→ Material arzon bo'lsa ham, usta sifatiga e'tibor bering\n→ Gidroizolyatsiya **eng muhim** bosqich — tejamang!\n→ Plitka va santexnikani oldin tanlang, keyin ustani chaqiring`,
                    followUp: [
                        "Hammom ustasini chaqiring",
                        "Material tavsiyasi bering",
                        "Boshqa xona ta'mirlash narxi"
                    ]
                },

                heating: {
                    main: `🌡️ **Isitish Tizimlari — Ma'lumot:**\n\n**Radiator/Batareya muammolari:**\n→ Radiator isitmayapti — havo tiqilgan bo'lishi mumkin (kran Mayevskogo orqali havoni chiqaring)\n→ Radiator oqyapti — prokladka almashtiring yoki payvandlang\n→ Yangi radiator montaji: 200,000 - 400,000 so'm/dona\n\n**Issiq pol (Teplyy pol):**\n→ Suv issiq pol montaji: m² dan 80,000 - 150,000 so'm\n→ Elektr issiq pol: m² dan 50,000 - 100,000 so'm\n\n**Kotyol/Gazkolonka:**\n→ Kotyol montaji: 500,000 - 1,500,000 so'm\n→ Yillik texnik xizmat: 200,000 - 400,000 so'm`,
                    followUp: [
                        "Isitish ustasini chaqiring",
                        "Radiator almashtirish narxi",
                        "Issiq pol o'rnatish"
                    ]
                },

                water_filter: {
                    main: `💧 **Suv Filtrlash Tizimlari:**\n\n**Muammo:** O'zbekistondagi suv qattiqligi yuqori → ohak cho'kadi, asboblar tez buziladi\n\n**Yechimlar:**\n\n1️⃣ **Mexanik filtr** (Asosiy):\n→ Cho'kindi va zangdan tozalaydi\n→ Narxi: 80,000 - 200,000 so'm\n\n2️⃣ **Ugol filtr** (Ta'mni yaxshilaydi):\n→ Xlorni yo'qotadi, hidni ketkazadi\n→ Narxi: 150,000 - 400,000 so'm\n\n3️⃣ **Teskari osmos** (Eng sifatli):\n→ 99.9% tozalash, ichimlik suvi sifatida\n→ Narxi: 800,000 - 3,000,000 so'm\n→ Kartridj almashtirish: yiliga 200,000 - 400,000 so'm\n\n💡 **Maslahat:** Ariston va boshqa suv isitgichlarni uzoq muddatga saqlash uchun filtr **shart**!`,
                    followUp: [
                        "Filtr o'rnatish ustasini chaqiring",
                        "Qaysi filterni tavsiya qilasiz?",
                        "Suv isitgich uchun qaysi filtr?"
                    ]
                },

                general: {
                    responses: [
                        `Tushundim! Sizga yordam berishga tayyorman 🛠️\n\nMuammoni batafsilroq tushuntirsangiz, aniqroq maslahat va usta tavsiya qila olaman.\n\nMasalan:\n• Qaysi hududdansiz?\n• Qanday xizmat kerak (santexnik, elektrik, ...)?  \n• Muammo nima (oqyapti, tiqilgan, buzilgan...)?`,
                        `Albatta! MySantexnik.uz platformasida 500 dan ortiq tasdiqlangan ustalar bor.\n\nSizga aniq yordam berish uchun menga quyidagilarni ayting:\n📍 Manzil (tuman yoki shahar)\n🔧 Xizmat turi\n⏰ Qachon kerak?\n\nYoki tezkor tugmalardan birini tanlang 👇`,
                        `Yaxshi savol! Men santexnika, elektrika va uy ta'mirlash bo'yicha professional maslahat beraman.\n\nQanday muammo haqida gapiryapsiz? Aniqroq yozsangiz, eng to'g'ri yechimni topib beraman! 💡`
                    ]
                }
            };
        }

        buildTips() {
            return [
                "💡 Suv ventelining joyini oila a'zolaringizga ham ko'rsatib qo'ying — avariyada tezda topiladi!",
                "💡 Kran tomchilab tursa, oyiga 400+ litr suv isrof bo'ladi. Tezroq ta'mirlating!",
                "💡 Ariston isitgichni har 1-2 yilda profilaktika qildiring — umri uzayadi.",
                "💡 Kanalizatsiyaga yog', soch va axlatlarni tashlamang — tiqilish asosiy sababi shu!",
                "💡 Qishda tashqi trubalarni izolyatsiya qiling — muzlash trubani yorishi mumkin.",
                "💡 Vannaxona remontida gidroizolyatsiyaga pul tejamang — kelajakda katta muammolardan saqlaydi!",
                "💡 Suvni tejaydigan kran aeratorlari o'rnatib, oylik xarajatni 30% kamaytiring.",
                "💡 Unitaz bachogiga 1.5 litrlik idish solib qo'ying — har bosishda 1.5 litr suv tejaladi!",
            ];
        }

        buildPrices() {
            return [
                { service: 'Kran/Smesitel almashtirish', min: 80000, max: 150000, icon: '🚰' },
                { service: 'Unitaz montaji va ulash', min: 120000, max: 250000, icon: '🚽' },
                { service: 'Truba tiqilishini tozalash', min: 100000, max: 250000, icon: '🔧' },
                { service: 'Ariston/Suv isitgich montaji', min: 150000, max: 280000, icon: '🌡️' },
                { service: 'Vanna/Dush kabina o\'rnatish', min: 250000, max: 500000, icon: '🛁' },
                { service: 'Kanalizatsiya trubasi almashtirish', min: 200000, max: 600000, icon: '🔩' },
                { service: 'Radiator montaji (1 dona)', min: 200000, max: 400000, icon: '♨️' },
                { service: 'Suv filtri o\'rnatish', min: 100000, max: 300000, icon: '💧' },
                { service: 'Elektr rozetka/vilka o\'rnatish', min: 40000, max: 80000, icon: '🔌' },
                { service: 'Konditsioner montaji', min: 300000, max: 600000, icon: '❄️' },
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
    // 4. SUHBAT BOSHQARUVCHISI — Kontekst va Xotira
    // ═══════════════════════════════════════════════════════════════
    class ConversationManager {
        constructor() {
            this.history = [];
            this.context = {
                lastIntent: null,
                lastLocation: null,
                lastService: null,
                userName: null,
                isFirstMessage: true,
                questionsAsked: 0,
                suggestedWorkers: false
            };
            this.maxHistory = 20;
        }

        addMessage(role, text, intent = null, entities = null) {
            this.history.push({
                role,
                text,
                intent,
                entities,
                timestamp: Date.now()
            });

            // Xotirani yangilash
            if (role === 'user' && intent) {
                this.context.lastIntent = intent;
                this.context.questionsAsked++;
                this.context.isFirstMessage = false;
            }

            if (entities) {
                if (entities.location) this.context.lastLocation = entities.location;
                if (entities.service) this.context.lastService = entities.service;
            }

            // Tarixni cheklash
            if (this.history.length > this.maxHistory) {
                this.history = this.history.slice(-this.maxHistory);
            }
        }

        getContext() {
            return { ...this.context };
        }

        getLastBotMessage() {
            for (let i = this.history.length - 1; i >= 0; i--) {
                if (this.history[i].role === 'bot') return this.history[i];
            }
            return null;
        }

        getConversationSummary() {
            return {
                totalMessages: this.history.length,
                topicsDiscussed: [...new Set(this.history.filter(m => m.intent).map(m => m.intent))],
                lastLocation: this.context.lastLocation,
                lastService: this.context.lastService
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. ASOSIY USTAJON AI KLASSI
    // ═══════════════════════════════════════════════════════════════
    class UstajonAI {
        constructor() {
            this.isOpen = false;
            this.isListening = false;
            this.isAccessibilityMode = localStorage.getItem('ustajon_a11y') === 'true';
            this.isTyping = false;
            this.recognition = null;
            this.currentSpeakingUtterance = null;
            this.streamAbortController = null;

            // AI komponentlari
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
                            <p><i class="fa-solid fa-bolt" style="color:#facc15;font-size:10px;"></i> MySantexnik.uz — aqlli yordamchi</p>
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

                <!-- SOS Banner -->
                <div class="ustajon-sos-banner" id="ustajonSosBanner">
                    <span><i class="fa-solid fa-triangle-exclamation"></i> Shoshilinch avariya holatimi?</span>
                    <a href="tel:+998712000000" class="ustajon-sos-call-btn">
                        <i class="fa-solid fa-phone-volume"></i> Qo'ng'iroq
                    </a>
                </div>

                <!-- Body -->
                <div class="ustajon-body" id="ustajonBody"></div>

                <!-- Quick Prompts -->
                <div class="ustajon-suggestions" id="ustajonSuggestions">
                    <button class="ustajon-chip" data-prompt="Suv toshib ketyapti, nima qilay?!">🚨 Suv toshdi!</button>
                    <button class="ustajon-chip" data-prompt="Chilonzordan santexnik usta topib ber">📍 Chilonzorga usta</button>
                    <button class="ustajon-chip" data-prompt="Kran va truba almashtirish narxi qancha?">💰 Smeta hisoblash</button>
                    <button class="ustajon-chip" data-prompt="Ko'zi ojizlar uchun qanday yordam bera olasan?">♿ Ovozli xizmat</button>
                    <button class="ustajon-chip" data-prompt="Ariston isitmayapti, sababi nima?">🛁 Ariston nosozligi</button>
                </div>

                <!-- Footer -->
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

            // Boshlang'ich xabar
            this.sendBotWelcome();
        }

        sendBotWelcome() {
            const timeGreeting = this.kb.getTimeOfDayGreeting();
            const welcomeText = `${timeGreeting} Assalomu alaykum!\n\nMen **Ustajon AI** — MySantexnik.uz ning aqlli yordamchisiman 👨‍🔧\n\nQanday muammo bo'yicha yordam kerak?\n\n• 🔧 *"Kran oqib turibdi"* — Diagnostika va maslahat\n• 👷 *"Chilonzorga santexnik chaqir"* — Usta topish\n• 💰 *"Narxlarni bilmoqchiman"* — Smeta hisoblash\n• 🚨 *"Suv toshib ketyapti!"* — Tezkor yordam\n\n🎙️ **Mikrofon** orqali ovoz bilan ham gapirishingiz mumkin!`;
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
                    if (e.error === 'not-allowed') {
                        this.renderBotMessage('⚠️ Mikrofon ruxsati berilmagan. Brauzer sozlamalaridan mikrofon ruxsatini yoqing yoki matn orqali yozing.', true);
                    }
                };

                this.recognition.onend = () => {
                    this.stopListening();
                };
            }
        }

        // ─── Hodisalar ──────────────────────────────────────
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

            // Escape bilan yopish
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
                        "Chilonzor tumaniga santexnik usta kerak edi",
                        "Kranimdan suv oqib toshib ketyapti, yordam bering!",
                        "Unitaz va vanna o'rnatish narxi qancha bo'ladi?",
                        "Ariston suv isitmayapti, sababi nima?",
                        "Kanalizatsiya tiqilib qoldi, yordam bering"
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

        // ─── Accessibility ──────────────────────────────────
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

        // ═════════════════════════════════════════════════════
        // XABAR YUBORISH VA AI JAVOB GENERATSIYASI
        // ═════════════════════════════════════════════════════
        handleSend() {
            const input = document.getElementById('ustajonInput');
            if (!input || this.isTyping) return;
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            sound.playPop();

            // NLP tahlil
            const analysis = this.nlp.analyze(text);

            // Suhbat tarixiga qo'shish
            this.conversation.addMessage('user', text, analysis.intent, analysis.entities);

            // Foydalanuvchi xabarini ko'rsatish
            this.renderUserMessage(text);
            this.showTypingIndicator();

            // AI "o'ylash" simulyatsiyasi — murakkabroq savolga ko'proq vaqt
            const thinkingTime = analysis.entities.urgency === 'critical' ? 400 : 600 + Math.random() * 600;

            setTimeout(() => {
                this.removeTypingIndicator();
                this.generateResponse(analysis);
            }, thinkingTime);
        }

        /**
         * AI JAVOB GENERATSIYASI — Asosiy mantiq
         */
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
                    extraHTML = this.buildEmergencyCard();
                    followUpSuggestions = responses.emergency.followUp;
                    break;

                case 'find_worker':
                    const loc = entities.location || context.lastLocation;
                    const svc = entities.service || context.lastService;
                    responseText = responses.find_worker.main(loc, svc);
                    extraHTML = this.buildWorkerCards(loc, svc);
                    followUpSuggestions = responses.find_worker.followUp;
                    break;

                case 'pricing':
                    responseText = responses.pricing.main;
                    extraHTML = this.buildPriceTable();
                    followUpSuggestions = responses.pricing.followUp;
                    break;

                case 'ariston_problem':
                    responseText = responses.ariston_problem.main;
                    followUpSuggestions = responses.ariston_problem.followUp;
                    break;

                case 'pipe_problem':
                    responseText = responses.pipe_problem.main;
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

                case 'installation':
                    responseText = responses.installation.main;
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
                    followUpSuggestions = ['Usta kerak', 'Narxlar haqida', 'Muammo bor'];
                    break;

                case 'thanks':
                    const thanksArr = responses.thanks.responses;
                    responseText = thanksArr[Math.floor(Math.random() * thanksArr.length)];
                    followUpSuggestions = ['Yana savol bor', 'Usta chaqiring', 'Boshqa xizmatlar'];
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

                case 'bathroom_renovation':
                    responseText = responses.bathroom_renovation.main;
                    followUpSuggestions = responses.bathroom_renovation.followUp;
                    break;

                case 'heating':
                    responseText = responses.heating.main;
                    followUpSuggestions = responses.heating.followUp;
                    break;

                case 'water_filter':
                    responseText = responses.water_filter.main;
                    followUpSuggestions = responses.water_filter.followUp;
                    break;

                default:
                    // Kontekstni tekshirish — avvalgi suhbatga oid bo'lishi mumkin
                    if (context.lastIntent && confidence < 0.3) {
                        responseText = this.generateContextualResponse(analysis, context);
                    } else {
                        const generalArr = responses.general.responses;
                        responseText = generalArr[Math.floor(Math.random() * generalArr.length)];
                    }
                    followUpSuggestions = ['Usta topib bering', 'Narxlar haqida', 'Muammoni tushuntiring'];
                    break;
            }

            // Maslahat qo'shish (har 3-chi xabarda)
            if (this.conversation.context.questionsAsked % 3 === 0 && intent !== 'greeting' && intent !== 'thanks') {
                responseText += `\n\n---\n${this.kb.getRandomTip()}`;
            }

            // Suhbat tarixiga qo'shish
            this.conversation.addMessage('bot', responseText, intent);

            // Stream effekti bilan ko'rsatish
            this.streamBotMessage(responseText, extraHTML, followUpSuggestions);
        }

        /**
         * Kontekstga asoslangan javob
         */
        generateContextualResponse(analysis, context) {
            const q = analysis.originalText.toLowerCase();

            // "Ha", "yo'q" kabi qisqa javoblar
            if (q.match(/^(ha|haa|xa|ok|bo'ldi|yaxshi|davom|kerak|albatta)$/i)) {
                if (context.lastIntent === 'find_worker') {
                    return `Ajoyib! Sizga eng yaqin ustani bog'lab beraman. Qaysi hududdansiz?`;
                }
                if (context.lastIntent === 'pricing') {
                    return `Yaxshi! Aniq qaysi xizmat bo'yicha smeta hisoblashni xohlaysiz? Masalan: kran almashtirish, unitaz o'rnatish, truba tozalash...`;
                }
                return `Tushundim! Davom etamiz. Qanday yordam kerak?`;
            }

            if (q.match(/^(yo'q|yoq|kerak emas|rahmat)$/i)) {
                return `Yaxshi, tushundim! Agar kelajakda biror savol bo'lsa, bemalol murojaat qiling. MySantexnik.uz har doim xizmatingizda! 😊`;
            }

            // Joylashuv so'ragan bo'lishi mumkin
            if (analysis.entities.location && context.lastIntent === 'find_worker') {
                const loc = analysis.entities.location;
                return this.kb.responses.find_worker.main(loc, context.lastService);
            }

            return `Tushundim! Sizga yordam berishga tayyorman 🛠️\n\nAniqroq tushuntirsangiz, eng to'g'ri javobni beraman. Masalan:\n• Qaysi hududdansiz?\n• Qanday muammo bor?\n• Qanday xizmat kerak?`;
        }

        // ═════════════════════════════════════════════════════
        // STREAM EFFEKT BILAN XABAR KO'RSATISH
        // ═════════════════════════════════════════════════════
        streamBotMessage(markdownText, extraHTML = '', followUpSuggestions = []) {
            const body = document.getElementById('ustajonBody');
            if (!body) return;

            this.isTyping = true;
            sound.playPop();

            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const msgEl = document.createElement('div');
            msgEl.className = 'ustajon-msg bot';
            msgEl.innerHTML = `
                <div class="ustajon-msg-avatar">👨‍🔧</div>
                <div class="ustajon-bubble">
                    <div class="ustajon-stream-content"></div>
                    <div class="ustajon-msg-footer" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                            <button class="ustajon-speak-btn" title="Ovoz chiqarib o'qish">
                                <i class="fa-solid fa-volume-high"></i> Ovozli eshitish
                            </button>
                            <div class="ustajon-bubble-time">${time}</div>
                        </div>
                    </div>
                </div>
            `;

            body.appendChild(msgEl);

            const streamContainer = msgEl.querySelector('.ustajon-stream-content');
            const msgFooter = msgEl.querySelector('.ustajon-msg-footer');

            // Stream effekti — harf-harf chiqarish
            const formattedText = this.formatMarkdown(markdownText);
            const chars = [...formattedText];
            let i = 0;
            let buffer = '';
            const isTag = () => buffer.endsWith('<');
            let inTag = false;

            const streamInterval = setInterval(() => {
                if (i >= chars.length) {
                    clearInterval(streamInterval);

                    // Extra HTML qo'shish
                    if (extraHTML) {
                        const extraContainer = document.createElement('div');
                        extraContainer.className = 'ustajon-extra-content';
                        extraContainer.style.animation = 'msgFadeIn 0.4s ease-out';
                        extraContainer.innerHTML = extraHTML;
                        streamContainer.appendChild(extraContainer);
                    }

                    // Footer ko'rsatish
                    if (msgFooter) msgFooter.style.display = 'block';

                    // Follow-up takliflar
                    if (followUpSuggestions.length > 0) {
                        this.updateSuggestions(followUpSuggestions);
                    }

                    // Ovozli tinglash hodisasi
                    const speakBtn = msgEl.querySelector('.ustajon-speak-btn');
                    if (speakBtn) {
                        const plainText = streamContainer.innerText;
                        speakBtn.addEventListener('click', () => {
                            this.speakText(plainText, speakBtn);
                        });
                    }

                    // Accessibility rejimida avtomatik o'qish
                    if (this.isAccessibilityMode) {
                        const plainText = streamContainer.innerText;
                        const speakBtn2 = msgEl.querySelector('.ustajon-speak-btn');
                        this.speakText(plainText, speakBtn2);
                    }

                    this.isTyping = false;
                    sound.playSuccess();
                    body.scrollTop = body.scrollHeight;
                    return;
                }

                const char = chars[i];

                // HTML teglarni to'liq qo'shish (harf-harf emas)
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

                // Scroll
                if (i % 5 === 0) {
                    body.scrollTop = body.scrollHeight;
                }

                i++;
            }, 8); // 8ms — tez va silliq

            body.scrollTop = body.scrollHeight;
        }

        /**
         * Follow-up takliflarni yangilash
         */
        updateSuggestions(suggestions) {
            const suggestionsContainer = document.getElementById('ustajonSuggestions');
            if (!suggestionsContainer) return;

            suggestionsContainer.innerHTML = '';
            suggestions.forEach(text => {
                const chip = document.createElement('button');
                chip.className = 'ustajon-chip';
                chip.setAttribute('data-prompt', text);
                chip.textContent = text;
                chip.style.animation = 'msgFadeIn 0.3s ease-out';
                suggestionsContainer.appendChild(chip);
            });
        }

        // ═════════════════════════════════════════════════════
        // KARTOCHKA GENERATORLARI
        // ═════════════════════════════════════════════════════
        buildEmergencyCard() {
            return `
                <div class="ustajon-emergency-card">
                    <strong><i class="fa-solid fa-bolt"></i> MySantexnik.uz Tezkor Avariya Xizmati:</strong>
                    <ol>
                        <li>Aziz Nematov — <a href="tel:+998901234567" style="color:#b91c1c;font-weight:700;">+998 90 123-45-67</a> (Yetib borish: ~15 daqiqa)</li>
                        <li>Jasur Rahimov — <a href="tel:+998971234567" style="color:#b91c1c;font-weight:700;">+998 97 123-45-67</a> (Yetib borish: ~20 daqiqa)</li>
                        <li>Dispetcher: <a href="tel:+998712000000" style="color:#b91c1c;font-weight:700;">+998 71 200-00-00</a> (24/7)</li>
                    </ol>
                    <a href="tel:+998712000000" class="ustajon-emergency-call-btn" style="background:#dc2626;color:#fff;text-align:center;margin-top:6px;padding:10px;border-radius:10px;font-weight:700;text-decoration:none;display:block;font-size:14px;">
                        <i class="fa-solid fa-phone"></i> Avariya Dispetcheriga Qo'ng'iroq
                    </a>
                </div>
            `;
        }

        buildWorkerCards(location, service) {
            const targetArea = location ? location.fullName : "Toshkent shahri";

            // Bazadan ustalarni olish
            let workersList = [];
            try {
                const saved = localStorage.getItem('mock_workers');
                if (saved) workersList = JSON.parse(saved);
            } catch (e) { }

            if (!workersList || workersList.length === 0) {
                workersList = [
                    { full_name: "Aziz Nematov", phone: "+998901234567", category: "santexnik", experience_years: 5, city: "Toshkent shahri", avg_rating: 4.9, total_reviews: 18, description: "Kran, truba, unitaz — barcha turdagi santexnika ishlari" },
                    { full_name: "Jasur Rahimov", phone: "+998971234567", category: "santexnik", experience_years: 8, city: targetArea, avg_rating: 4.8, total_reviews: 24, description: "Ariston, isitish tizimlari, kanalizatsiya" },
                    { full_name: "Oybek Toshmatov", phone: "+998931234567", category: "santexnik", experience_years: 12, city: targetArea, avg_rating: 4.95, total_reviews: 42, description: "Vannaxona to'liq remont, gidroizolyatsiya" }
                ];
            }

            // Xizmatga mos ustalarni filtrlash
            let filtered = workersList;
            if (service && service.category) {
                const serviceFiltered = workersList.filter(w =>
                    w.category && w.category.toLowerCase() === service.category.toLowerCase()
                );
                if (serviceFiltered.length > 0) filtered = serviceFiltered;
            }

            let cardsHTML = `<div class="ustajon-card-grid">`;
            filtered.slice(0, 3).forEach((w, idx) => {
                const rating = w.avg_rating || (4.5 + Math.random() * 0.5).toFixed(1);
                const reviews = w.total_reviews || Math.floor(5 + Math.random() * 30);
                const exp = w.experience_years || Math.floor(3 + Math.random() * 10);
                const verified = idx < 2;

                cardsHTML += `
                    <div class="ustajon-worker-card">
                        <div class="worker-card-header">
                            <span class="worker-card-name">
                                <i class="fa-solid fa-user-tie"></i> ${w.full_name}
                                ${verified ? '<i class="fa-solid fa-circle-check" style="color:#3b82f6;font-size:11px;margin-left:4px;" title="Tasdiqlangan"></i>' : ''}
                            </span>
                            <span class="worker-card-rating"><i class="fa-solid fa-star"></i> ${rating} <small>(${reviews})</small></span>
                        </div>
                        ${w.description ? `<div style="font-size:11.5px;color:var(--text-muted,#64748b);margin:2px 0;">${w.description}</div>` : ''}
                        <div class="worker-card-details">
                            <span><i class="fa-solid fa-briefcase"></i> ${exp} yil tajriba</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${targetArea}</span>
                        </div>
                        <div class="worker-card-actions">
                            <a href="tel:${w.phone}" class="worker-call-btn">
                                <i class="fa-solid fa-phone"></i> Qo'ng'iroq
                            </a>
                            <button class="worker-view-btn" onclick="if(document.getElementById('workers')){document.getElementById('workers').scrollIntoView({behavior:'smooth'});window.ustajonAI&&window.ustajonAI.closeWindow();}">
                                <i class="fa-solid fa-user"></i> Profil
                            </button>
                        </div>
                    </div>
                `;
            });
            cardsHTML += `</div>`;

            return cardsHTML;
        }

        buildPriceTable() {
            const prices = this.kb.prices;
            let html = `<div class="ustajon-calc-card">`;
            prices.forEach(p => {
                html += `
                    <div class="calc-row">
                        <span>${p.icon} ${p.service}:</span>
                        <strong>${this.formatNumber(p.min)} – ${this.formatNumber(p.max)} so'm</strong>
                    </div>
                `;
            });
            html += `
                <div class="calc-row total">
                    <span>✅ Barcha ishlar kafolat bilan</span>
                    <span>MySantexnik.uz</span>
                </div>
            </div>
            <p style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">
                * Yakuniy narx materiallar va ishning murakkabligiga qarab usta tomonidan joyida aniqlanadi.
                <br>* Narxlarga material kiritilmagan — faqat ish haqi ko'rsatilgan.
            </p>`;
            return html;
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

        // ─── UI Xabar render qilish ────────────────────────
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

            const speakBtn = msgEl.querySelector('.ustajon-speak-btn');
            const plainText = msgEl.querySelector('.ustajon-bubble').innerText.replace("Ovozli eshitish", "").trim();

            if (speakBtn) {
                speakBtn.addEventListener('click', () => {
                    this.speakText(plainText, speakBtn);
                });
            }

            body.appendChild(msgEl);
            body.scrollTop = body.scrollHeight;

            if (autoSpeak && this.isAccessibilityMode) {
                this.speakText(plainText, speakBtn);
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

        // ─── Text-to-Speech ─────────────────────────────────
        speakText(text, btnElement = null) {
            if (!('speechSynthesis' in window)) {
                console.warn('SpeechSynthesis qo\'llab-quvvatlanmaydi');
                return;
            }

            window.speechSynthesis.cancel();

            const cleanText = text.replace(/[*#_~`—│├└●→•\-]/g, ' ').replace(/\s+/g, ' ').trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);

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

        // ─── Yordamchi funksiyalar ──────────────────────────
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
            // Chiziqcha ajratgich ---
            html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border,#e2e8f0);margin:8px 0;">');
            // Yangi qatorlar
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ISHGA TUSHIRISH
    // ═══════════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.ustajonAI = new UstajonAI();
        });
    } else {
        window.ustajonAI = new UstajonAI();
    }
})();
