// telegram_bot.js – Handles Telegram Bot widget initialization and API calls
// NOTE: Directly embedding the bot token in client-side code is insecure, but used per user approval.
const BOT_TOKEN = "8966416865:AAGT1Noq62gCAxZGtRT_jCVrP8Ln75uvi_4";

/**
 * Initialize Telegram login widget.
 * @param {string} botUsername - The bot's @username (without @).
 */
export function initTelegramWidget(botUsername) {
  const container = document.getElementById('telegram-widget-container');
  if (!container) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://telegram.org/js/telegram-widget.js?7`;
  script.setAttribute('data-telegram-login', botUsername);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '10');
  script.setAttribute('data-auth-url', '/auth/telegram'); // placeholder endpoint
  container.appendChild(script);
}

/**
 * Simple wrapper for Telegram Bot API via direct HTTP request.
 * This uses the bot token directly – make sure the token is kept low‑risk.
 */
export async function callBotAPI(method, payload = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

/** Example helper – send a welcome message when a user starts a chat */
export function sendWelcomeMessage(chatId) {
  callBotAPI('sendMessage', { chat_id: chatId, text: 'Welcome to Santexnik.uz!' });
}
