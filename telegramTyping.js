const axios = require('axios');

function computeDelay(reply) {
    return Math.min(reply.length * 40, 3000); // ms
}

/**
 * Shows typing action periodically, waits the delay, then sends the message.
 * - botToken: Telegram bot token (string)
 * - chatId: numeric/string chat id
 * - reply: text to send
 * - sendOptions: optional sendMessage params (parse_mode, reply_markup, etc)
 */
async function sendTypingThenMessage(botToken, chatId, reply, sendOptions = {}) {
    const delay = computeDelay(reply);
    const baseUrl = `https://api.telegram.org/bot${botToken}`;
    const typingUrl = `${baseUrl}/sendChatAction`;
    const sendUrl = `${baseUrl}/sendMessage`;

    // send initial typing action
    try {
        await axios.post(typingUrl, { chat_id: chatId, action: 'typing' });
    } catch (e) {
        // non-fatal, continue
    }

    // keep sending 'typing' every 900ms so Telegram UI stays active
    const intervalMs = 900;
    const interval = setInterval(() => {
        axios.post(typingUrl, { chat_id: chatId, action: 'typing' }).catch(()=>{});
    }, intervalMs);

    // wait for computed delay
    await new Promise((res) => setTimeout(res, delay));

    clearInterval(interval);

    // finally send the message
    try {
        const payload = Object.assign({ chat_id: chatId, text: reply }, sendOptions);
        return (await axios.post(sendUrl, payload)).data;
    } catch (err) {
        console.error('Failed to send telegram message:', err.response?.data || err.message);
        throw err;
    }
}

module.exports = { sendTypingThenMessage, computeDelay };