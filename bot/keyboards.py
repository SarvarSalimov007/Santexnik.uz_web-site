from telegram import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup

def main_menu_keyboard():
    keyboard = [
        ["🔍 Usta qidirish", "⭐️ Reytingli ustalar"],
        ["📋 So'rov yuborish", "ℹ️ Platforma haqida"],
        ["🌐 Saytga o'tish"]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

def category_keyboard():
    keyboard = [
        [
            InlineKeyboardButton("🚰 Santexnik", callback_data="cat_santexnik"),
            InlineKeyboardButton("⚡️ Elektrik", callback_data="cat_elektrik")
        ],
        [
            InlineKeyboardButton("🔨 Ta'mirchi", callback_data="cat_umumiy_tamir"),
            InlineKeyboardButton("❄️ Konditsioner", callback_data="cat_konditsioner")
        ],
        [
            InlineKeyboardButton("🪚 Duradgor", callback_data="cat_duradgor"),
            InlineKeyboardButton("🧱 Suvaqchi", callback_data="cat_suvaqchi")
        ],
        [
            InlineKeyboardButton("🔲 Plitakash", callback_data="cat_plitakash"),
            InlineKeyboardButton("⚙️ Svarkachi", callback_data="cat_svarka")
        ],
        [InlineKeyboardButton("⬅️ Orqaga", callback_data="back_to_main")]
    ]
    return InlineKeyboardMarkup(keyboard)

def contact_category_keyboard():
    """Category selection for contact requests."""
    keyboard = [
        [
            InlineKeyboardButton("🚰 Santexnik", callback_data="contact_cat_santexnik"),
            InlineKeyboardButton("⚡️ Elektrik", callback_data="contact_cat_elektrik")
        ],
        [
            InlineKeyboardButton("🔨 Ta'mirchi", callback_data="contact_cat_umumiy_tamir"),
            InlineKeyboardButton("❄️ Konditsioner", callback_data="contact_cat_konditsioner")
        ],
        [
            InlineKeyboardButton("🪚 Duradgor", callback_data="contact_cat_duradgor"),
            InlineKeyboardButton("⚙️ Svarkachi", callback_data="contact_cat_svarka")
        ],
    ]
    return InlineKeyboardMarkup(keyboard)

def worker_action_keyboard(worker_id):
    keyboard = [
        [
            InlineKeyboardButton("📞 Raqamini ko'rish", callback_data=f"contact_{worker_id}"),
            InlineKeyboardButton("⭐️ Baho berish", callback_data=f"rate_{worker_id}")
        ],
        [InlineKeyboardButton("⬅️ Orqaga", callback_data="back_to_categories")]
    ]
    return InlineKeyboardMarkup(keyboard)

def rating_keyboard(worker_id):
    keyboard = [
        [
            InlineKeyboardButton("1 ⭐️", callback_data=f"star_1_{worker_id}"),
            InlineKeyboardButton("2 ⭐️", callback_data=f"star_2_{worker_id}"),
            InlineKeyboardButton("3 ⭐️", callback_data=f"star_3_{worker_id}")
        ],
        [
            InlineKeyboardButton("4 ⭐️", callback_data=f"star_4_{worker_id}"),
            InlineKeyboardButton("5 ⭐️", callback_data=f"star_5_{worker_id}")
        ],
        [InlineKeyboardButton("❌ Bekor qilish", callback_data="cancel_rating")]
    ]
    return InlineKeyboardMarkup(keyboard)
