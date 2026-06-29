import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters
from config import BOT_TOKEN
import handlers

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

def main():
    """Start the bot."""
    if BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        logger.error("Please set a valid bot token in config.py!")
        return

    # Create the Application and pass it your bot's token.
    application = Application.builder().token(BOT_TOKEN).build()

    # Command handlers
    application.add_handler(CommandHandler("start", handlers.start))
    application.add_handler(CommandHandler("help", handlers.help_command))
    application.add_handler(CommandHandler("admin", handlers.admin_command))

    # Text message handler
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handlers.handle_text))
    
    # Callback queries (inline buttons)
    application.add_handler(CallbackQueryHandler(handlers.button_callback))

    # Run the bot until the user presses Ctrl-C
    logger.info("🤖 Santexnik.uz bot ishga tushdi!")
    application.run_polling(allowed_updates=Update.ALL_UPDATES)

if __name__ == "__main__":
    main()
