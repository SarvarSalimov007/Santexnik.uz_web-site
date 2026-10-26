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
        // Clear any hardcoded fake mock workers
        let workers = JSON.parse(localStorage.getItem('mock_workers') || '[]');
        workers = workers.filter(w => w.full_name !== 'Aziz Nematov' && w.full_name !== 'Javohir Tursunov' && w.full_name !== 'Jasur Rahimov');
        localStorage.setItem('mock_workers', JSON.stringify(workers));

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

                if (url.includes('/ai/chat')) {
                    const data = JSON.parse(options.body || '{}');
                    const rawMsg = (data.message || '').toLowerCase();
                    const lang = data.language || 'uz';
                    
                    let reply = "";
                    let intent = "general";
                    let chips = [];

                    if (/tosh|avariya|yoril|portla|suv bos|sos|затопило|прорвало|авария|burst|flood/.test(rawMsg)) {
                        intent = "emergency";
                        reply = lang === 'ru' ? "🚨 **ВНИМАНИЕ! Экстренная аварийная ситуация!**\n\n1️⃣ **Срочно перекройте главный вентиль воды!**\n2️⃣ **Обесточьте квартиру!** (Выключите автомат в щитке)\n3️⃣ **Предупредите соседей снизу!**\n\nАварийный мастер прибудет в течение 20-30 минут." :
                                (lang === 'en' ? "🚨 **ATTENTION! Emergency plumbing situation!**\n\n1️⃣ **Shut off the main water valve immediately!**\n2️⃣ **Turn off the electrical breaker!**\n3️⃣ **Alert lower neighbors!**\n\nEmergency dispatch crew arrives in 20-30 mins." :
                                "🚨 **DIQQAT! Favqulodda avariya holati!**\n\n1️⃣ **Asosiy suv ventilini darhol yoping!**\n2️⃣ **Elektr avtomatini o'chiring!**\n3️⃣ **Pastki qavat qo'shnilaringizni ogohlantiring!**\n\nNavbatchi dispetcherimiz va usta 20-30 daqiqada yetib boradi.");
                        chips = ["📞 24/7 Dispetcher", "Ventilni topa olmadim", "Avariya brigadasi"];
                    } else if (/muz|muzla|muzlagan|zamerz|otogrev|freeze|frozen/.test(rawMsg)) {
                        intent = "frozen_pipes";
                        reply = lang === 'ru' ? "❄️ **Отогрев замерзших труб:**\n\n⚠️ **ОСТОРОЖНО: Не грейте трубы открытым огнем!**\n1️⃣ Откройте смеситель.\n2️⃣ Прогревайте строительным феном от крана к стояку.\n3️⃣ Утеплите пенофлексом." :
                                (lang === 'en' ? "❄️ **Frozen Pipe Thawing Safety:**\n\n⚠️ **CAUTION: Never use open flames on pipes!**\n1️⃣ Keep faucets open.\n2️⃣ Warm with a heat gun from tap inwards.\n3️⃣ Insulate with foam." :
                                "❄️ **Muzlagan Quvurlarni Eritish Xavfsizligi:**\n\n⚠️ **DIQQAT: Quvurlarga ochiq olov tekkizmang!**\n1️⃣ Kranni ochiq qoldiring.\n2️⃣ Qurilish feni bilan kran tomondan qizdiring.\n3️⃣ Penofleks izolyatsiya qiling.");
                        chips = ["Avariya ustasi", "Izolyatsiya", "Dispetcher"];
                    } else if (/bosim|davlen|napor|sust|sekin|kam oqyapti|напор|давлен|pressure/.test(rawMsg)) {
                        intent = "water_pressure";
                        reply = lang === 'ru' ? "🚰 **Слабый напор воды:**\n\n• Прочистите сеточку аэратора смесителя и фильтр-грязевик перед счетчиком.\n• При слабом давлении на верхних этажах установите повысительный насос (150,000 - 300,000 сум)." :
                                (lang === 'en' ? "🚰 **Low Water Pressure:**\n\n• Clean faucet aerator and coarse strainer before meter.\n• Install an in-line booster pump for upper floors (150,000 - 300,000 UZS)." :
                                "🚰 **Suv Bosimi Pastligi (Davleniye):**\n\n• Kran aeratori va hisoblagich oldidagi filtr to'rini tozalang.\n• Yuqori qavatlarga suv chiqmasa, avtomatik bosim nasosi (gidrofor) o'rnatish lozim (150,000 - 300,000 so'm).");
                        chips = ["Nasos ustasi chaqirish", "Aeratorni tozalash", "Smeta"];
                    } else if (/radiator|batarey|otoplen|mayevsk|isitish|теплый пол|heating/.test(rawMsg)) {
                        intent = "radiator_heating";
                        reply = lang === 'ru' ? "♨️ **Отопление и радиаторы:**\n\n• Батарея греет наполовину: Спустите воздух через кран Маевского.\n• Расчет: 1 секция биметалла на 1.5–1.8 кв.м.\n• Монтаж радиатора: 180,000 - 300,000 сум/точка." :
                                (lang === 'en' ? "♨️ **Heating Radiators:**\n\n• Cold spots: Bleed air using Mayevsky valve.\n• Sizing: 1 bimetal section per 1.5 sq.m.\n• Installation: 180,000 - 300,000 UZS/point." :
                                "♨️ **Isitish Tizimlari va Batareyalar:**\n\n• Batareyaning yarmi sovuq bo'lsa: Mayevskiy krani orqali havo chiqaring.\n• Sektsiya hisobi: 1 sektsiya bimetall ~1.5 kv.m ga to'g'ri keladi.\n• Radiator montaji: 180,000 - 300,000 so'm/nuqta.");
                        chips = ["Mayevskiy krani", "Isitish ustasi", "Issiq pol"];
                    } else if (/hid|badboy|sassiq|zapax|sifon|trap|odor|smell/.test(rawMsg)) {
                        intent = "sewer_smell";
                        reply = lang === 'ru' ? "🦨 **Запах из канализации:**\n\n• Высох гидрозатвор: залейте 1 л воды в слив и трапы.\n• Проверьте U-образный изгиб гофры под раковиной.\n• Замените резиновую манжету стыка с трубой." :
                                (lang === 'en' ? "🦨 **Sewer Odor:**\n\n• Dry water trap: pour 1L water to restore seal.\n• Ensure drain hose has a proper U-bend.\n• Reseal pipe sleeve gasket with silicone." :
                                "🦨 **Kanalizatsiyadan Badbo'y Hid Kelishi:**\n\n• Gidrozatvor qurigan bo'lsa, trap va sifonga 1 litr suv quying.\n• Sifon gofrasi U-shaklida egilgan bo'lishi shart.\n• Quvur manshetkasini yangilang va silikonlang.");
                        chips = ["Kanalizatsiya ustasi", "Gofra almashtirish", "Smeta"];
                    } else if (/filtr|osmos|ochist|tozalagich|purifier|filter/.test(rawMsg)) {
                        intent = "water_filter";
                        reply = lang === 'ru' ? "🧪 **Фильтры воды и обратный осмос:**\n\n• Замена картриджей: каждые 3–6 месяцев.\n• Мембрана осмоса: раз в 1.5–2 года.\n• Установка системы осмоса: 120,000 - 200,000 сум." :
                                (lang === 'en' ? "🧪 **Water Filter & RO Systems:**\n\n• Pre-filter cartridges: every 3-6 months.\n• RO membrane: every 1.5-2 years.\n• Installation: 120,000 - 200,000 UZS." :
                                "🧪 **Suv Filtrlari va Teskari Osmos:**\n\n• 1, 2, 3-bosqich kartridjlar: har 3-6 oyda almashtiriladi;\n• Osmos membranasi: har 1.5-2 yilda;\n• Filtr o'rnatish narxi: 120,000 - 200,000 so'm.");
                        chips = ["Filtr ustasi", "Kartridj almashtirish", "Smeta"];
                    } else if (/svarka|payvand|ekoplastik|polipropilen|welding|ppr/.test(rawMsg)) {
                        intent = "pipes_welding";
                        reply = lang === 'ru' ? "🔥 **Пайка труб (Экопластик / PP-R):**\n\n• Температура паяльника: строго 260°C.\n• Время нагрева: 20мм — 5с, 25мм — 7с, 32мм — 8с.\n• Разводка труб: 40,000 - 80,000 сум/метр." :
                                (lang === 'en' ? "🔥 **Polypropylene (PP-R) Pipe Welding:**\n\n• Iron temp: strictly 260°C.\n• Dwell time: 20mm (5s), 25mm (7s), 32mm (8s).\n• Piping labor: 40,000 - 80,000 UZS/meter." :
                                "🔥 **Plastik Quvurlarni Payvandlash (Ekoplastik/PP-R):**\n\n• Dazmol harorati: qat'iy 260°C bo'lishi shart.\n• Qizdirish vaqti: 20mm (5s), 25mm (7s), 32mm (8s).\n• Truba montaji: 40,000 - 80,000 so'm/metr.");
                        chips = ["Payvandlash ustasi", "Truba narxlari", "Smeta"];
                    } else if (/schetchik|hisoblagich|plomba|счетчик|meter/.test(rawMsg)) {
                        intent = "water_meter";
                        reply = lang === 'ru' ? "💧 **Счетчики воды:**\n\n• Схема: Кран → Грязевик → Счетчик → Обратный клапан.\n• Монтаж: 80,000 - 150,000 сум/точка.\n• Опломбировка через ЦГУ/Сувсоз." :
                                (lang === 'en' ? "💧 **Water Meters:**\n\n• Setup: Valve → Strainer → Meter → Check valve.\n• Cost: 80,000 - 150,000 UZS/point." :
                                "💧 **Suv Hisoblagich (Schetchik):**\n\n• O'rnatish tartibi: Ventil → Gryazevik filtr → Schetchik → Obratnyy klapan.\n• Montaj narxi: 80,000 - 150,000 so'm.\n• Plombalash 'Suvsoz' orqali amalga oshiriladi.");
                        chips = ["Schetchik ustasi", "Obratnyy klapan", "Smeta"];
                    } else if (/ariston|boyler|boiler|kotel|isitgich|ten|аристон|бойлер/.test(rawMsg)) {
                        intent = "ariston";
                        reply = lang === 'ru' ? "🛁 **Водонагреватель (Аристон):**\n\n• Не греет: сгорел ТЭН от накипи (замена: 150,000 - 250,000 сум).\n• Капает снизу: сработал клапан сброса или течь бака.\n• ⚡ Бьет током: немедленно отключите от розетки!" :
                                (lang === 'en' ? "🛁 **Water Heater (Ariston):**\n\n• Not heating: burned heating element (TEN) (150,000 - 250,000 UZS).\n• Dripping: safety valve releasing pressure or tank leak.\n• ⚡ Shock: unplug immediately!" :
                                "🛁 **Ariston / Suv Isitgich Nosozligi:**\n\n• Suv isitmasa: TEN ohak yig'ilib kuygan (almashtirish: 150,000 - 250,000 so'm).\n• Pastdan tomchilasa: Xavfsizlik klapani bosimni tushiryapti yoki bak chirigan.\n• ⚡ Elektr toki ursa: Zudlik bilan rozetkadan uzing!");
                        chips = ["Ariston ustasi", "TEN narxi", "Profilaktika"];
                    } else if (/tiqil|zasor|oqova|kanalizats|tros|засор|прочистк|clog|drain/.test(rawMsg)) {
                        intent = "pipe_clog";
                        reply = lang === 'ru' ? "🔧 **Засор канализации:**\n\n1️⃣ 1 стакан соды + 1 стакан уксуса, через 20 минут промыть кипятком.\n2️⃣ Прокачать вантузом под давлением.\n3️⃣ Сантехнический трос / гидродинамика: 100,000 - 220,000 сум." :
                                (lang === 'en' ? "🔧 **Drain & Pipe Clog:**\n\n1️⃣ 1 cup baking soda + 1 cup vinegar, wait 20 min, flush with boiling water.\n2️⃣ Plunge firmly.\n3️⃣ Snake cable or jet cleaning: 100,000 - 220,000 UZS." :
                                "🔧 **Kanalizatsiya Tiqilishi (Zasor):**\n\n1️⃣ 1 stakan soda + 1 stakan sirka, 20 daqiqadan so'ng qaynoq suv quying.\n2️⃣ Vantuz bilan bosim bering.\n3️⃣ Santexnik tros yoki gidrodinamik tozalash: 100,000 - 220,000 so'm.");
                        chips = ["Kanalizatsiya ustasi", "Vantuz yordam bermadi", "Smeta"];
                    } else if (/kran|smesitel|kartridj|buksa|jo'mrak|смесител|кран|faucet|tap/.test(rawMsg)) {
                        intent = "faucet";
                        reply = lang === 'ru' ? "🚰 **Смесители и краны:**\n\n• Капает: замена картриджа 35/40мм или кран-буксы (40,000 - 70,000 сум).\n• Монтаж нового смесителя: 80,000 - 150,000 сум (гарантия 30 дней)." :
                                (lang === 'en' ? "🚰 **Faucets & Mixer Taps:**\n\n• Dripping: replace 35/40mm cartridge or gland (40,000 - 70,000 UZS).\n• Installation of new tap: 80,000 - 150,000 UZS." :
                                "🚰 **Kran va Smesitellar:**\n\n• Tomchilab tursa: Keramik kartridj 35/40mm yoki buksani almashtirish (40,000 - 70,000 so'm).\n• Yangi smesitel montaji: 80,000 - 150,000 so'm.");
                        chips = ["Kran o'rnatish", "Kartridj almashtirish", "Smeta"];
                    } else if (/unitaz|bachok|slivnoy|унитаз|бачок|toilet|flush/.test(rawMsg)) {
                        intent = "toilet";
                        reply = lang === 'ru' ? "🚽 **Ремонт унитаза и бачка:**\n\n• Вода течет в чашу: износ мембраны или поплавкового клапана (50,000 - 100,000 сум).\n• Монтаж унитаза / инсталляции: 140,000 - 280,000 сум." :
                                (lang === 'en' ? "🚽 **Toilet & Cistern Repair:**\n\n• Continuous running water: flush membrane or float valve repair (50,000 - 100,000 UZS).\n• New toilet install: 140,000 - 280,000 UZS." :
                                "🚽 **Unitaz va Bachok Ta'mirlash:**\n\n• Bachokdan suv oqsa: Slivnoy armatura va klapanni sozlash (50,000 - 100,000 so'm).\n• Yangi unitaz/installyatsiya montaji: 140,000 - 280,000 so'm.");
                        chips = ["Unitaz ustasi", "Bachok armaturasi", "Installyatsiya"];
                    } else if (/narx|qancha|smeta|цена|сколько|стоимость|price|cost/.test(rawMsg)) {
                        intent = "pricing";
                        reply = lang === 'ru' ? "💰 **Расценки Santexnik.uz (2026):**\n\n• Установка смесителя: 80,000 - 150,000 сум\n• Установка унитаза: 140,000 - 250,000 сум\n• Прочистка засора: 100,000 - 220,000 сум\n• Чистка Аристона: 150,000 - 280,000 сум" :
                                (lang === 'en' ? "💰 **Official Rates 2026:**\n\n• Faucet install: 80k - 150k UZS\n• Toilet install: 140k - 250k UZS\n• Drain cleaning: 100k - 220k UZS\n• Boiler service: 150k - 280k UZS" :
                                "💰 **Santexnik.uz — 2026-yil Xizmat Narxlari:**\n\n• Kran montaji: 80,000 - 150,000 so'm\n• Unitaz montaji: 140,000 - 250,000 so'm\n• Truba tozalash: 100,000 - 220,000 so'm\n• Ariston tozalash/TEN: 150,000 - 280,000 so'm");
                        chips = ["Smeta hisoblash", "Usta chaqirish", "Kafolat"];
                    } else if (/usta|santexnik|chaqir|мастер|сантехник|plumber/.test(rawMsg)) {
                        intent = "find_worker";
                        const activeWorkers = (workers || []).filter(w => w.is_active !== false);
                        if (activeWorkers.length > 0) {
                            reply = lang === 'ru' ? `👨‍🔧 Найдено ${activeWorkers.length} проверенных специалистов, зарегистрированных в системе:` :
                                    (lang === 'en' ? `👨‍🔧 Found ${activeWorkers.length} verified masters registered in our platform:` :
                                    `👨‍🔧 Baza bo'yicha ${activeWorkers.length} nafar faol va tasdiqlangan ustalar saralandi:`);
                            chips = ["Ariza qoldirish", "Smeta hisoblash", "Dispetcher"];
                            resolve({
                                reply,
                                intent,
                                confidence: 0.96,
                                language: lang,
                                suggested_chips: chips,
                                matched_workers: activeWorkers.slice(0, 3)
                            });
                            return;
                        } else {
                            reply = lang === 'ru' ? "👷‍♂️ **К сожалению, в данном районе пока нет свободных мастеров, добавленных администратором.**\n\nВы можете оставить онлайн-заявку или связаться с круглосуточным диспетчером:" :
                                    (lang === 'en' ? "👷‍♂️ **Currently, there are no available technicians registered in this area by the administrator.**\n\nYou can submit an online request or call our 24/7 dispatcher:" :
                                    "👷‍♂️ **Hozircha bu hudud bo'yicha admin tomonidan qo'shilgan faol usta mavjud emas.**\n\nZudlik bilan yordam kerak bo'lsa, navbatchi dispetcherimizga ariza qoldirishingiz yoki qo'ng'iroq qilishingiz mumkin:");
                            chips = ["📝 Ariza qoldirish", "📞 24/7 Dispetcher", "Smeta hisoblash"];
                            resolve({
                                reply,
                                intent,
                                confidence: 0.96,
                                language: lang,
                                suggested_chips: chips,
                                matched_workers: []
                            });
                            return;
                        }
                    } else {
                        reply = lang === 'ru' ? "Здравствуйте! Я Ustajon AI 👨‍🔧 Помогу с ремонтом сантехники, отоплением, фильтрами и расчетом сметы в Ташкенте." :
                                (lang === 'en' ? "Hello! I am Ustajon AI 👨‍🔧 Ready to help with plumbing, heaters, drains and instant estimates." :
                                "Assalomu alaykum! Men Ustajon AI 👨‍🔧 Sizga santexnika, isitish, filtratsiya va avariya holatlarida professional yordam beraman.");
                        chips = ["🚨 Suv toshdi (SOS)", "📷 Rasm diagnostikasi", "📊 Smeta hisoblash", "👨‍🔧 Usta topish"];
                    }

                    resolve({
                        reply,
                        intent,
                        confidence: 0.96,
                        language: lang,
                        suggested_chips: chips,
                        matched_workers: []
                    });
                    return;
                }

                if (url.includes('/ai/vision')) {
                    const data = JSON.parse(options.body || '{}');
                    const fname = (data.filename || '').toLowerCase();
                    const notes = (data.notes || '').toLowerCase();
                    const comb = `${fname} ${notes}`;
                    const lang = data.language || 'uz';

                    let defect_title = "Smesitel qistirmasi (prokladka) yoki kartridj yeyilgan";
                    let component = "Kran / Smesitel";
                    let severity = "O'rtacha (Suv tomchilaydi)";
                    let estimated_cost = "50,000 - 90,000 so'm";
                    let action_plan = "Keramik kartridjni almashtirish va silikonlash.";
                    let suggested_specialist = "Santexnik Usta";
                    let safety_warning = null;

                    if (/ariston|boyler|boiler|kotel|isitgich/.test(comb)) {
                        component = "Ariston suv isitgich";
                        defect_title = "Isitish elementi (TEN) ohaklangan va korroziyaga uchragan";
                        severity = "Yuqori (Xavf darajasi: 8/10)";
                        estimated_cost = "150,000 - 280,000 so'm";
                        action_plan = "Elektrni o'chirish, bakni to'kish, TEN va magniy anodni almashtirish.";
                        suggested_specialist = "Ariston bo'yicha usta";
                        safety_warning = "Elektr toki urish xavfi mavjud!";
                    } else if (/truba|quvur|pipe|kanalizats|drain|zasor/.test(comb)) {
                        component = "Kanalizatsiya quvuri";
                        defect_title = "Quvur tutashuvida yoriq va rezinka mansheta yeyilishi";
                        severity = "O'rta-Yuqori (Suv sizmoqda)";
                        estimated_cost = "100,000 - 220,000 so'm";
                        action_plan = "Gofra/tutashmani yangilash, germetik FUM tasma va silikonlash.";
                        suggested_specialist = "Kanalizatsiya ustasi";
                        safety_warning = "Pastki qavatni suv bosish ehtimoli bor!";
                    } else if (/unitaz|bachok|toilet/.test(comb)) {
                        component = "Unitaz bachogi";
                        defect_title = "Slivnoy mexanizm membranasi qotgan va to'xtovsiz suv oqmoqda";
                        severity = "O'rtacha (Suv isrofi)";
                        estimated_cost = "60,000 - 120,000 so'm";
                        action_plan = "Bachok armaturasini yechib tozalash yoki to'liq yangilash.";
                        suggested_specialist = "Santexnik mutaxassis";
                    } else if (/radiator|batarey|otoplen/.test(comb)) {
                        component = "Isitish radiatori";
                        defect_title = "Sektsiyalararo paronit qistirma yemirilgan yoki Mayevskiy krani oqyapti";
                        severity = "Yuqori (Issiq suv oqishi)";
                        estimated_cost = "90,000 - 180,000 so'm";
                        action_plan = "Isitishni to'xtatish, suvni tushirish va prokladkani yangilash.";
                        suggested_specialist = "Isitish ustasi";
                        safety_warning = "Issiq suvdan kuyish xavfi bor!";
                    }

                    resolve({
                        defect_title,
                        component,
                        severity,
                        confidence: 0.97,
                        estimated_cost,
                        action_plan,
                        suggested_specialist,
                        safety_warning
                    });
                    return;
                }

                if (url.includes('/ai/estimate')) {
                    const data = JSON.parse(options.body || '{}');
                    const items = data.items || [];
                    const isUrgent = !!data.is_urgent;
                    let base = 0;
                    items.forEach(it => { base += (it.unit_price || 0) * (it.quantity || 1); });
                    const surcharge = isUrgent ? Math.round(base * 0.25) : 0;
                    resolve({
                        total_amount: base + surcharge,
                        items_breakdown: items,
                        urgent_surcharge: surcharge,
                        estimated_duration_hours: 1.5,
                        warranty_days: 30,
                        formatted_receipt: `JAMI SMETA: ${(base + surcharge).toLocaleString()} so'm`
                    });
                    return;
                }

                resolve({ success: true });
            }, 30); // Ultra-fast 30ms instant response
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

    // === Ustajon AI (Hybrid Real-Backend + Instant Fallback) ===
    async aiChat(data) {
        if (!IS_DEMO) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2200);
                const res = await fetch(`${this.baseUrl}/ai/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (res.ok) return await res.json();
            } catch (e) {
                // Smooth fallback
            }
        }
        return this._mockFetch(`${this.baseUrl}/ai/chat`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async aiVision(data) {
        if (!IS_DEMO) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(`${this.baseUrl}/ai/vision`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (res.ok) return await res.json();
            } catch (e) {
                // Smooth fallback
            }
        }
        return this._mockFetch(`${this.baseUrl}/ai/vision`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async aiEstimate(data) {
        if (!IS_DEMO) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 2000);
                const res = await fetch(`${this.baseUrl}/ai/estimate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (res.ok) return await res.json();
            } catch (e) {
                // Smooth fallback
            }
        }
        return this._mockFetch(`${this.baseUrl}/ai/estimate`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

const api = new ApiService(API_BASE_URL);
window.api = api;
