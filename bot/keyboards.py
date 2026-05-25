from telegram import InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup
from locations import REGIONS_LIST, UZ_LOCATIONS


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

def region_keyboard(category: str):
    """Build keyboard to select a region/city."""
    keyboard = []
    row = []
    for idx, name in enumerate(REGIONS_LIST):
        # clean name for display, e.g. "Toshkent shahri" -> "Toshkent sh."
        display_name = name.replace(" viloyati", " v.").replace(" shahri", " sh.").replace(" Respublikasi", "")
        row.append(InlineKeyboardButton(display_name, callback_data=f"r_{idx}_{category}"))
        if len(row) == 2:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)
    
    keyboard.append([
        InlineKeyboardButton("🌐 Barcha hududlar", callback_data=f"r_all_{category}")
    ])
    keyboard.append([
        InlineKeyboardButton("⬅️ Orqaga", callback_data="back_to_categories")
    ])
    return InlineKeyboardMarkup(keyboard)

def district_keyboard(region_idx: int, category: str):
    """Build keyboard to select a district within a region."""
    region_name = REGIONS_LIST[region_idx]
    districts = UZ_LOCATIONS[region_name]
    
    keyboard = []
    row = []
    for idx, name in enumerate(districts):
        # clean name for display
        display_name = name.replace(" tumani", " t.").replace(" shahri", " sh.")
        row.append(InlineKeyboardButton(display_name, callback_data=f"d_{region_idx}_{idx}_{category}"))
        if len(row) == 2:
            keyboard.append(row)
            row = []
    if row:
        keyboard.append(row)
        
    keyboard.append([
        InlineKeyboardButton("🌐 Butun viloyat bo'ylab", callback_data=f"d_{region_idx}_all_{category}")
    ])
    keyboard.append([
        InlineKeyboardButton("⬅️ Orqaga", callback_data=f"cat_{category}") # go back to region select (which is triggered by cat_<category>)
    ])
    return InlineKeyboardMarkup(keyboard)

