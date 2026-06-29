import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from telegram.constants import ParseMode
import keyboards
import requests
from config import API_BASE_URL, SUPER_ADMIN_ID
from locations import REGIONS_LIST, UZ_LOCATIONS


logger = logging.getLogger(__name__)

# ==============================
# User states for conversation
# ==============================
USER_STATE = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /start is issued."""
    user = update.effective_user
    
    # Check if deep link parameter exists (e.g., /start worker_3)
    if context.args and context.args[0].startswith("worker_"):
        worker_id = context.args[0].split("_")[1]
        try:
            response = requests.get(f"{API_BASE_URL}/workers/{worker_id}")
            if response.status_code == 200:
                worker = response.json()
                category_names = {
                    "santexnik": "🚰 Santexnik",
                    "elektrik": "⚡️ Elektrik",
                    "umumiy_tamir": "🔨 Ta'mirchi",
                    "konditsioner": "❄️ Konditsioner ustasi",
                    "duradgor": "🪚 Duradgor",
                    "suvaqchi": "🧱 Suvaqchi",
                    "plitakash": "🔲 Plitakash",
                    "svarka": "⚙️ Svarkachi",
                    "mebel_usta": "🪑 Mebel ustasi",
                    "tom_yopish": "🏠 Tom yopish ustasi",
                }
                cat = category_names.get(worker['category'], worker['category'])
                stars = "⭐️" * int(worker['avg_rating'])
                
                desc = worker.get('description') or "Ma'lumot kiritilmagan"
                msg = (
                    f"👨‍🔧 <b>{worker['full_name']}</b>\n\n"
                    f"📋 <b>Kasbi:</b> {cat}\n"
                    f"📍 <b>Hudud:</b> {worker.get('city', 'Kiritilmagan')}\n"
                    f"🏗 <b>Tajriba:</b> {worker['experience_years']} yil\n"
                    f"💰 <b>Narx:</b> {worker.get('price_range', 'Kelishilgan')}\n"
                    f"⭐️ <b>Reyting:</b> {worker['avg_rating']} ({worker['total_reviews']} ta izoh)\n\n"
                    f"📝 {desc}"
                )
                
                keyboard = [
                    [
                        InlineKeyboardButton("📞 Telefon qilish", callback_data=f"contact_{worker_id}"),
                        InlineKeyboardButton("⭐️ Baho berish", callback_data=f"rate_{worker_id}")
                    ]
                ]
                
                await update.message.reply_text(
                    msg,
                    reply_markup=InlineKeyboardMarkup(keyboard),
                    parse_mode=ParseMode.HTML
                )
                return
        except Exception as e:
            logger.error(f"Error fetching worker from deep link: {e}")
    
    welcome_text = (
        f"Assalomu alaykum, {user.first_name}! 👋\n\n"
        "🔧 <b>Mysantexnik-uz</b> - O'zbekistondagi professional ustalar platformasiga xush kelibsiz.\n\n"
        "Bu bot orqali siz o'zingizga kerakli mutaxassisni (santexnik, elektrik va h.k.) tez va oson topishingiz mumkin.\n\n"
        "📲 <b>To'g'ridan-to'g'ri ilovaga kirish uchun pastdagi tugmani bosing!</b>\n"
        "Yoki quyidagi menyudan kerakli bo'limni tanlang:"
    )
    
    # Add an inline button for the WebApp as well to make it prominent
    from telegram import WebAppInfo
    inline_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 Saytga kirish (Mini App)", web_app=WebAppInfo(url="https://mysantexnik-uz.vercel.app"))]
    ])
    
    await update.message.reply_text(
        welcome_text,
        reply_markup=inline_kb, # Give them the big inline button first
        parse_mode=ParseMode.HTML
    )
    # Then send the reply keyboard
    await update.message.reply_text(
        "Qo'shimcha funksiyalar:",
        reply_markup=keyboards.main_menu_keyboard()
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message when the command /help is issued."""
    help_text = (
        "📖 <b>Bot yo'riqnomasi va Yordam:</b>\n\n"
        "🔹 <b>Asosiy buyruqlar:</b>\n"
        "🚀 /start - Botni qayta ishga tushirish va Asosiy menyuni ochish\n"
        "❓ /help - Shu yordam xabarini ko'rish\n"
        "🛠 /admin - (Faqat adminlar uchun) Boshqaruv paneli\n\n"
        "🔹 <b>Qanday qilib usta topaman?</b>\n"
        "1. Eng qulay usul: Pastdagi <b>🚀 Saytga kirish (App)</b> tugmasini bosing.\n"
        "2. Yoki menyudan <b>🔍 Usta qidirish</b> tugmasi orqali kategoriyani tanlang.\n"
        "3. O'z viloyatingiz va tumaningizni tanlang.\n"
        "4. Sizga eng mos keluvchi ustalar ro'yxati chiqadi.\n\n"
        "🔹 <b>Usta chaqirish uchun ariza:</b>\n"
        "Agar o'zingiz qidirishni xohlamasangiz, <b>📋 So'rov yuborish</b> orqali ismingiz va raqamingizni qoldiring, biz sizga o'zimiz mos ustani topib beramiz!\n\n"
        "📞 Savollar va murojaatlar uchun: @admin_username"
    )
    
    from telegram import WebAppInfo
    help_kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 Dasturni ochish", web_app=WebAppInfo(url="https://mysantexnik-uz.vercel.app"))]
    ])
    
    await update.message.reply_text(help_text, parse_mode=ParseMode.HTML, reply_markup=help_kb)


async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle text messages from the reply keyboard."""
    text = update.message.text
    user_id = update.effective_user.id
    
    # Check if user is in a conversation state
    if user_id in USER_STATE:
        state = USER_STATE[user_id]
        
        if state.get("action") == "contact_request_name":
            USER_STATE[user_id] = {"action": "contact_request_phone", "name": text}
            await update.message.reply_text("📞 Telefon raqamingizni kiriting (masalan: +998901234567):")
            return
        
        elif state.get("action") == "contact_request_phone":
            USER_STATE[user_id] = {
                "action": "contact_request_category",
                "name": state["name"],
                "phone": text
            }
            await update.message.reply_text(
                "Qanday usta kerak? Tanlang:",
                reply_markup=keyboards.contact_category_keyboard()
            )
            return
        
        elif state.get("action") == "contact_request_message":
            # Final step - send the request
            try:
                data = {
                    "name": state["name"],
                    "phone": state["phone"],
                    "category": state.get("category"),
                    "message": text
                }
                response = requests.post(f"{API_BASE_URL}/contacts/", json=data)
                if response.status_code == 201:
                    await update.message.reply_text(
                        "✅ <b>So'rovingiz muvaffaqiyatli yuborildi!</b>\n\n"
                        "Adminlarimiz tez orada siz bilan bog'lanishadi.\n"
                        "Rahmat! 🙏",
                        parse_mode=ParseMode.HTML,
                        reply_markup=keyboards.main_menu_keyboard()
                    )
                else:
                    await update.message.reply_text(
                        "❌ Xatolik yuz berdi. Keyinroq urinib ko'ring.",
                        reply_markup=keyboards.main_menu_keyboard()
                    )
            except Exception as e:
                logger.error(f"Error sending contact request: {e}")
                await update.message.reply_text(
                    "❌ Server bilan ulanishda xatolik. Keyinroq urinib ko'ring.",
                    reply_markup=keyboards.main_menu_keyboard()
                )
            
            del USER_STATE[user_id]
            return
    
    if text == "🔍 Usta qidirish":
        await update.message.reply_text(
            "Qanday turdagi usta kerak? Tanlang:",
            reply_markup=keyboards.category_keyboard()
        )
    elif text == "📋 So'rov yuborish":
        USER_STATE[user_id] = {"action": "contact_request_name"}
        await update.message.reply_text(
            "📝 <b>Usta chaqirish uchun ariza</b>\n\n"
            "Ismingizni kiriting:",
            parse_mode=ParseMode.HTML
        )
    elif text == "⭐️ Reytingli ustalar":
        try:
            response = requests.get(f"{API_BASE_URL}/workers/")
            if response.status_code == 200:
                workers = response.json()
                if not workers:
                    await update.message.reply_text("Hozircha ustalar ro'yxati bo'sh.")
                    return
                
                # Sort by rating
                top_workers = sorted(workers, key=lambda x: x.get('avg_rating', 0), reverse=True)[:5]
                
                category_emojis = {
                    "santexnik": "🚰", "elektrik": "⚡️", "umumiy_tamir": "🔨",
                    "konditsioner": "❄️", "duradgor": "🪚", "suvaqchi": "🧱",
                    "plitakash": "🔲", "svarka": "⚙️", "mebel_usta": "🪑",
                }
                
                msg = "🏆 <b>Eng yuqori reytingli ustalar:</b>\n\n"
                for idx, w in enumerate(top_workers, 1):
                    emoji = category_emojis.get(w['category'], '👨‍🔧')
                    verified = " ✅" if w.get('is_verified') else ""
                    msg += (
                        f"{idx}. <b>{w['full_name']}</b>{verified}\n"
                        f"   {emoji} {w['category']} | ⭐️ {w['avg_rating']} ({w['total_reviews']} izoh)\n"
                        f"   📍 {w.get('city', 'Kiritilmagan')}\n\n"
                    )
                
                msg += "🔍 Batafsil ma'lumot uchun kategoriya tanlang."
                
                await update.message.reply_text(msg, parse_mode=ParseMode.HTML)
            else:
                await update.message.reply_text("Kechirasiz, server bilan ulanishda xatolik yuz berdi.")
        except Exception as e:
            logger.error(f"Error fetching top workers: {e}")
            await update.message.reply_text("Kechirasiz, xatolik yuz berdi. Keyinroq urinib ko'ring.")
    
    elif text == "ℹ️ Platforma haqida":
        try:
            response = requests.get(f"{API_BASE_URL}/stats")
            stats = response.json() if response.status_code == 200 else {}
        except:
            stats = {}
        
        total_workers = stats.get("total_workers", "500+")
        total_reviews = stats.get("total_reviews", "1000+")
        avg_rating = stats.get("avg_rating", "4.8")
        
        await update.message.reply_text(
            "🔧 <b>Mysantexnik-uz</b> - bu uy va ofisdagi nosozliklarni "
            "bartaraf etish uchun eng malakali ustalarni topish platformasi.\n\n"
            f"📊 <b>Statistika:</b>\n"
            f"👷 Faol ustalar: {total_workers}\n"
            f"📝 Jami izohlar: {total_reviews}\n"
            f"⭐️ O'rtacha reyting: {avg_rating}\n\n"
            "✅ <b>Bizning afzalliklarimiz:</b>\n"
            "• Tekshirilgan va tajribali ustalar\n"
            "• Mijozlar reytingi va izohlari\n"
            "• Qulay va tez qidiruv\n"
            "• Ochiq va adolatli narxlar\n"
            "• Telegram va veb-sayt integratsiyasi\n\n"
            "🌐 Sayt: mysantexnik-uz.vercel.app",
            parse_mode=ParseMode.HTML
        )
    
    elif text == "🌐 Saytga o'tish":
        keyboard = [[InlineKeyboardButton("🌐 Saytga o'tish", url="https://mysantexnik-uz.vercel.app")]]
        await update.message.reply_text(
            "Saytimizda barcha ustalarning to'liq profillari va aloqa ma'lumotlari mavjud.",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
    else:
        await update.message.reply_text(
            "Kechirasiz, bu buyruqni tushunmadim. 🤔\n"
            "Pastdagi tugmalardan foydalaning yoki /help buyrug'ini yuboring.",
            reply_markup=keyboards.main_menu_keyboard()
        )


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Parses the CallbackQuery and updates the message text."""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    user_id = update.effective_user.id
    
    category_names = {
        "santexnik": "🚰 Santexniklar",
        "elektrik": "⚡️ Elektriklar",
        "umumiy_tamir": "🔨 Ta'mirchilar",
        "konditsioner": "❄️ Konditsioner ustalari",
        "duradgor": "🪚 Duradgorlar",
        "suvaqchi": "🧱 Suvaqchilar",
        "plitakash": "🔲 Plitakashlar",
        "svarka": "⚙️ Svarkashilar",
        "mebel_usta": "🪑 Mebel ustalari",
        "tom_yopish": "🏠 Tom yopish ustalari",
    }
    
    if data.startswith("cat_"):
        category = data.split("_", 1)[1]
        cat_name = category_names.get(category, "Ustalar")
        await query.edit_message_text(
            f"🔍 <b>{cat_name}</b>\n\n📍 Qaysi viloyat/shahardan usta qidiryapsiz?",
            reply_markup=keyboards.region_keyboard(category),
            parse_mode=ParseMode.HTML
        )
    
    elif data.startswith("r_"):
        # Format: r_{region_idx}_{category} or r_all_{category}
        parts = data.split("_")
        region_val = parts[1]
        category = parts[2]
        cat_name = category_names.get(category, "Ustalar")
        
        if region_val == "all":
            await show_workers_list(query, category, cat_name)
        else:
            region_idx = int(region_val)
            region_name = REGIONS_LIST[region_idx]
            await query.edit_message_text(
                f"🔍 <b>{cat_name}</b> | 📍 {region_name}\n\n"
                f"Qaysi tumandan usta qidiryapsiz? Tanlang:",
                reply_markup=keyboards.district_keyboard(region_idx, category),
                parse_mode=ParseMode.HTML
            )
            
    elif data.startswith("d_"):
        # Format: d_{region_idx}_{district_val}_{category} where district_val is index or "all"
        parts = data.split("_")
        region_idx = int(parts[1])
        district_val = parts[2]
        category = parts[3]
        cat_name = category_names.get(category, "Ustalar")
        
        region_name = REGIONS_LIST[region_idx]
        
        if district_val == "all":
            await show_workers_list(query, category, cat_name, city=region_name)
        else:
            district_idx = int(district_val)
            district_name = UZ_LOCATIONS[region_name][district_idx]
            await show_workers_list(query, category, cat_name, city=region_name, district=district_name)

    
    elif data.startswith("worker_"):
        worker_id = data.split("_")[1]
        try:
            response = requests.get(f"{API_BASE_URL}/workers/{worker_id}")
            if response.status_code == 200:
                w = response.json()
                cat = category_names.get(w['category'], w['category'])
                
                desc = w.get('description') or "Ma'lumot kiritilmagan"
                msg = (
                    f"👨‍🔧 <b>{w['full_name']}</b>\n\n"
                    f"📋 <b>Kasbi:</b> {cat}\n"
                    f"📍 <b>Hudud:</b> {w.get('city', 'Kiritilmagan')}\n"
                    f"🏗 <b>Tajriba:</b> {w['experience_years']} yil\n"
                    f"💰 <b>Narx:</b> {w.get('price_range', 'Kelishilgan')}\n"
                    f"⭐️ <b>Reyting:</b> {w['avg_rating']} ({w['total_reviews']} ta izoh)\n\n"
                    f"📝 {desc}"
                )
                
                await query.edit_message_text(
                    msg,
                    reply_markup=keyboards.worker_action_keyboard(worker_id),
                    parse_mode=ParseMode.HTML
                )
            else:
                await query.edit_message_text("Usta topilmadi.")
        except Exception as e:
            logger.error(f"Error fetching worker {worker_id}: {e}")
            await query.edit_message_text("Tarmoqda xatolik yuz berdi.")
    
    elif data == "back_to_categories":
        await query.edit_message_text(
            "Qanday turdagi usta kerak? Tanlang:",
            reply_markup=keyboards.category_keyboard()
        )
    
    elif data == "back_to_main":
        await query.edit_message_text("Asosiy menyu. Pastdagi tugmalardan foydalaning. 👇")
        
    elif data.startswith("contact_"):
        worker_id = data.split("_")[1]
        try:
            response = requests.get(f"{API_BASE_URL}/workers/{worker_id}")
            if response.status_code == 200:
                worker = response.json()
                tg = worker.get('telegram_username')
                tg_link = f"\n💬 Telegram: @{tg}" if tg else ""
                
                await query.message.reply_text(
                    f"📞 <b>Aloqa ma'lumotlari:</b>\n\n"
                    f"👨‍🔧 {worker['full_name']}\n"
                    f"📱 Telefon: +{worker['phone']}{tg_link}\n\n"
                    f"💡 <i>Iltimos, telefon qilganingizda Santexnik.uz orqali topganingizni ayting.</i>",
                    parse_mode=ParseMode.HTML
                )
            else:
                await query.message.reply_text("Ustani topib bo'lmadi.")
        except Exception as e:
            logger.error(f"Error fetching worker {worker_id}: {e}")
            await query.message.reply_text("Tarmoqda xatolik yuz berdi.")
        
    elif data.startswith("rate_"):
        worker_id = data.split("_")[1]
        await query.message.reply_text(
            "Iltimos, ustaning ishiga baho bering (1-5 yulduz):",
            reply_markup=keyboards.rating_keyboard(worker_id)
        )
        
    elif data.startswith("star_"):
        parts = data.split("_")
        rating = int(parts[1])
        worker_id = parts[2]
        stars = "⭐️" * rating
        
        # Try to actually submit the rating
        # Note: In production, would need user authentication
        await query.edit_message_text(
            f"✅ Rahmat! Siz ustaga {stars} baho berdingiz.\n\n"
            "Sizning bahoyingiz platformani yaxshilashga yordam beradi! 🙏"
        )
        
    elif data == "cancel_rating":
        await query.edit_message_text("Baho berish bekor qilindi. ❌")
    
    elif data.startswith("contact_cat_"):
        # Contact request category selection
        category = data.split("contact_cat_")[1]
        if user_id in USER_STATE:
            USER_STATE[user_id]["category"] = category
            USER_STATE[user_id]["action"] = "contact_request_message"
            await query.edit_message_text(
                f"✅ Kategoriya tanlandi.\n\n"
                "📝 Endi muammoingizni qisqacha tasvirlab bering:"
            )


# ==============================
# Admin Commands
# ==============================

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin panel - show admin options."""
    user_id = update.effective_user.id
    
    # Simple admin check by Telegram ID
    if user_id != SUPER_ADMIN_ID:
        await update.message.reply_text("⛔️ Sizda admin huquqlari yo'q.")
        return
    
    try:
        stats_resp = requests.get(f"{API_BASE_URL}/stats")
        stats = stats_resp.json() if stats_resp.status_code == 200 else {}
    except:
        stats = {}
    
    msg = (
        "🔐 <b>Admin Panel</b>\n\n"
        f"📊 <b>Statistika:</b>\n"
        f"👷 Faol ustalar: {stats.get('total_workers', 'N/A')}\n"
        f"📝 Jami izohlar: {stats.get('total_reviews', 'N/A')}\n"
        f"👥 Foydalanuvchilar: {stats.get('total_users', 'N/A')}\n"
        f"⭐️ O'rtacha reyting: {stats.get('avg_rating', 'N/A')}\n\n"
        "📋 <b>Admin buyruqlari:</b>\n"
        "/admin - Bu panel\n"
        "/addworker - Yangi usta qo'shish\n"
        "/contacts - So'rovlar ro'yxati\n"
    )
    
    await update.message.reply_text(msg, parse_mode=ParseMode.HTML)


async def show_workers_list(query, category, cat_name, city=None, district=None):
    """Helper function to fetch and show workers filtered by category, city, and district."""
    params = {"category": category}
    location_str = ""
    if city:
        params["city"] = city
        location_str += f" | 📍 {city}"
    if district:
        params["district"] = district
        location_str += f" ({district})"
        
    try:
        response = requests.get(f"{API_BASE_URL}/workers/", params=params)
        if response.status_code == 200:
            workers = response.json()
            if not workers:
                msg = f"Bu hududda ({cat_name}{location_str}) hozircha ustalar yo'q. 😕\n\n"
                if district:
                    region_idx = REGIONS_LIST.index(city)
                    reply_markup = keyboards.district_keyboard(region_idx, category)
                    msg += "Boshqa tuman tanlab ko'ring:"
                else:
                    reply_markup = keyboards.region_keyboard(category)
                    msg += "Boshqa hudud tanlab ko'ring:"
                    
                await query.edit_message_text(
                    msg,
                    reply_markup=reply_markup
                )
                return
            
            msg = f"🔍 <b>{cat_name}</b>{location_str}\n\nTopilgan ustalar ({len(workers)} ta):\n\n"
            for idx, w in enumerate(workers[:5], 1):
                verified = " ✅" if w.get('is_verified') else ""
                category_emojis = {
                    "santexnik": "🚰", "elektrik": "⚡️", "umumiy_tamir": "🔨",
                    "konditsioner": "❄️", "duradgor": "🪚", "suvaqchi": "🧱",
                    "plitakash": "🔲", "svarka": "⚙️", "mebel_usta": "🪑",
                }
                emoji = category_emojis.get(w['category'], '👨‍🔧')
                address_str = f" ({w.get('address')})" if w.get('address') else ""
                msg += (
                    f"{idx}. <b>{w['full_name']}</b>{verified}\n"
                    f"   📍 {w.get('city', 'Kiritilmagan')}{address_str} | "
                    f"⭐️ {w['avg_rating']} | "
                    f"🏗 {w['experience_years']} yil\n\n"
                )
            
            if len(workers) > 5:
                msg += f"... va yana {len(workers) - 5} ta usta.\n"
            
            msg += "\nUsta tanlang:"
            
            worker_buttons = []
            for w in workers[:5]:
                worker_buttons.append([
                    InlineKeyboardButton(
                        f"👤 {w['full_name']} (⭐️{w['avg_rating']})",
                        callback_data=f"worker_{w['id']}"
                    )
                ])
                
            if city:
                region_idx = REGIONS_LIST.index(city)
                worker_buttons.append([InlineKeyboardButton("⬅️ Orqaga", callback_data=f"r_{region_idx}_{category}")])
            else:
                worker_buttons.append([InlineKeyboardButton("⬅️ Orqaga", callback_data=f"cat_{category}")])
            
            await query.edit_message_text(
                msg,
                reply_markup=InlineKeyboardMarkup(worker_buttons),
                parse_mode=ParseMode.HTML
            )
        else:
            await query.edit_message_text("Server bilan xatolik yuz berdi.")
    except Exception as e:
        logger.error(f"Error fetching workers: {e}")
        await query.edit_message_text("Tarmoqda xatolik yuz berdi.")

