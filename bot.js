/**
 * Akshat's Personal AI Agent - Telegram Bot
 * Main entry point
 */
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => res.send("Bot is running"));

app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));


require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { processMessage } = require('./agent');
const { sendTypingThenMessage } = require('./telegramTyping');
const agent = require('./agent');

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Akshat\'s Personal AI Agent is starting...');

/**
 * Handle /start command
 */
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `👋 *Welcome to Akshat's Personal AI Agent!*

I can help you with:
• Information about Akshat
• His projects and portfolio
• Social links (Blog, Instagram, LinkedIn)
• Latest tech news
• General questions (powered by AI)
• Schedule appointments

Just ask me anything! 🚀`;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

/**
 * Handle /help command
 */
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🆘 *How to use this bot:*

*Personal Questions:*
• "Who are you?"
• "Tell me about Akshat"
• "Show me his projects"
• "Share his social links"

*Tech News:*
• "Latest tech news"
• "Technology updates"

*General Questions:*
• Ask anything! I'll use AI to help.

*Appointments:*
• "Schedule a meeting"
• "Book an appointment"

Try it out! 💬`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

/**
 * Handle all text messages
 */
bot.on('message', async (msg) => {
    // Ignore commands (already handled)
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    const chatId = msg.chat.id;
    const userMessage = msg.text;
    const userId = msg.from.id;
    const userName = msg.from.first_name || 'User';

    console.log(`[${new Date().toISOString()}] Message from ${userName} (${userId}): ${userMessage}`);

    try {
        // Process message through AI agent
        const result = await agent.processMessage(userMessage);

        // send typing then reply
        try {
            await sendTypingThenMessage(process.env.TELEGRAM_BOT_TOKEN, chatId, result.response, {
                parse_mode: 'Markdown' // optional
            });
        } catch (err) {
            console.error('Failed to send reply with typing:', err);
            // fallback: direct sendMessage via axios or your existing method
        }

        // Handle escalation to Akshat
        if (result.action === 'ESCALATE_TO_AKSHAT') {
            const akshatId = process.env.AKSHAT_TELEGRAM_ID;

            if (akshatId) {
                const escalationMessage = `🔔 *New Escalation*\n\nFrom: ${userName} (ID: ${userId})\nMessage: "${userMessage}"\n\nPlease respond to this user.`;

                bot.sendMessage(akshatId, escalationMessage, { parse_mode: 'Markdown' })
                    .catch(err => console.error('Failed to notify Akshat:', err.message));
            } else {
                console.warn('⚠️ AKSHAT_TELEGRAM_ID not set. Cannot escalate.');
            }
        }

        // Log the action taken
        console.log(`[Agent] Action: ${result.action}, Query: ${result.query || 'N/A'}`);

    } catch (error) {
        console.error('Error processing message:', error);
        bot.sendMessage(chatId, '❌ Sorry, I encountered an error. Please try again later.');
    }
});

/**
 * Error handling
 */
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code, error.message);
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

console.log('✅ Bot is running! Send a message to get started.');
