/**
 * Akshat's Personal AI Agent - Core Intelligence
 * Handles intent detection and response generation
 */

const axios = require('axios');

// Custom data about Akshat
const AKSHAT_DATA = {
  about: `Akshat is a developer building automation + AI projects. He writes blogs about real-world automation workflows, posts tech content on Instagram, shares professional updates on LinkedIn, and builds hobby projects to showcase them.`,

  links: {
    blog: 'http://curiumblogs.netlify.app/',
    instagram: 'https://www.instagram.com/curiumakshat/',
    linkedin: 'https://www.linkedin.com/in/akshat-raj-1266b6377/',
    projects: 'https://github.com/curiumakshat'
  },

  projects: [
    'WhatsApp Payment Extractor - Automated payment tracking via WhatsApp',
    'n8n Automation Workflows - Custom workflow automation solutions',
    'AI-powered Telegram Bots - Smart assistants with API integrations'
  ]
};

/**
 * Detect user intent from message
 */
function detectIntent(message) {
  const lowerMsg = message.toLowerCase().trim();

  // Personal info about Akshat
  if (
    lowerMsg.includes('who are you') ||
    lowerMsg.includes('about akshat') ||
    lowerMsg.includes('tell me about') ||
    lowerMsg.includes('who is akshat')
  ) {
    return 'ABOUT_AKSHAT';
  }

  // Projects
  if (
    lowerMsg.includes('project') ||
    lowerMsg.includes('portfolio') ||
    lowerMsg.includes('github') ||
    lowerMsg.includes('what does he build') ||
    lowerMsg.includes('what have you built')
  ) {
    return 'PROJECTS';
  }

  // Social links
  if (
    lowerMsg.includes('instagram') ||
    lowerMsg.includes('linkedin') ||
    lowerMsg.includes('blog') ||
    lowerMsg.includes('social') ||
    lowerMsg.includes('links') ||
    lowerMsg.includes('contact')
  ) {
    return 'LINKS';
  }

  // Tech news
  if (
    lowerMsg.includes('tech news') ||
    lowerMsg.includes('latest tech') ||
    lowerMsg.includes('technology news') ||
    lowerMsg.includes('tech updates') ||
    (lowerMsg.includes('news') && lowerMsg.includes('tech'))
  ) {
    return 'TECH_NEWS';
  }

  // Appointment/scheduling
  if (
    lowerMsg.includes('appointment') ||
    lowerMsg.includes('schedule') ||
    lowerMsg.includes('meeting') ||
    lowerMsg.includes('book a call') ||
    lowerMsg.includes('talk to akshat')
  ) {
    return 'APPOINTMENT';
  }

  // Default: general question
  return 'GENERAL';
}

/**
 * Generate response based on intent
 */
async function generateResponse(message, intent) {
  switch (intent) {
    case 'ABOUT_AKSHAT':
      return {
        response: `👋 Hi! I'm Akshat's Personal AI Agent.\n\n${AKSHAT_DATA.about}\n\nWant to know more? Ask me about his projects, blog, or social links!`,
        action: 'NONE',
        query: null
      };

    case 'PROJECTS':
      const projectList = AKSHAT_DATA.projects.map((p, i) => `${i + 1}. ${p}`).join('\n');
      return {
        response: `🚀 Here are some of Akshat's projects:\n\n${projectList}\n\nCheck out more on GitHub: ${AKSHAT_DATA.links.projects}`,
        action: 'NONE',
        query: null
      };

    case 'LINKS':
      return {
        response: `🔗 Connect with Akshat:\n\n📝 Blog: ${AKSHAT_DATA.links.blog}\n📸 Instagram: ${AKSHAT_DATA.links.instagram}\n💼 LinkedIn: ${AKSHAT_DATA.links.linkedin}\n💻 GitHub: ${AKSHAT_DATA.links.projects}`,
        action: 'NONE',
        query: null
      };

    case 'TECH_NEWS':
      return {
        response: '📰 Fetching the latest tech news for you...',
        action: 'CALL_NEWS_API',
        query: 'top-technology-news'
      };

    case 'APPOINTMENT':
      return {
        response: '📅 Sure! Let me check with Akshat and confirm. I\'ll get back to you soon.',
        action: 'ESCALATE_TO_AKSHAT',
        query: null
      };

    case 'GENERAL':
    default:
      return {
        response: '🤔 Let me think about that...',
        action: 'CALL_GEMINI',
        query: message
      };
  }
}

/**
 * Call Google Gemini API for general questions
 */
async function callGeminiAPI(query) {
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `
You are Akshat's AI clone.

Your job is to respond EXACTLY like Akshat in tone, slang, humour, energy, pacing, emoji usage, and attitude.

### AKSHAT STYLE PROFILE

• Language mix: English,Hinglish, chill, casual.
• Tone: Playful, confident, slightly chaotic, friendly.
• Often starts with: "bro", "abe", "dude", "lol", "bruhh".
• Emojis: Uses 😭😂🔥💀 sparingly but with impact.
• Humor: Light roasting, self-aware jokes, non-serious reactions.
• Typical reactions:
  - Confused: "bruhh?", "lol what"
  - Annoyed: "bruhh?"
  - Excited: "broooo🔥", "LMAOOOOO"
  - Casual: "kindoff", "still on it", "on project"
• Writing style:
  - Short, punchy responses.
  - Doesn't over-explain unless needed.
  - Adds small relatable comments like "deadly combo", "best thing to happen", "dekh lenge bhai".
  - Slang-heavy, friendly, relatable.
• Persona:
  - Chill + slightly sarcastic.
  - Tech bro vibes.
  - Makes fun of the situation lightly.
  - Easily switches between Hindi & English.
  - Puts emojis at the end, not in every line.

### RULES
1. ALWAYS reply in Akshat's style.
2. Keep replies short, fun, conversational.
3. If user asks something boring → make it fun.
4. If user asks dumb question → give light roast (Akshat-style).
5. If user annoys → reply "bruhh?" (Akshat default irritated reaction).
6. No formal tone. No robotic answers.
7. Use Hinglish naturally.

User: ${query}
`

              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return 'I encountered an issue connecting to my knowledge base. Please try again later.';
  }
}

/**
 * Call NewsAPI for tech news
 */
async function callNewsAPI() {
  try {
    const response = await axios.get(process.env.NEWS_API_URL, {
      params: {
        category: 'technology',
        country: 'us',
        pageSize: 5,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    const articles = response.data.articles;

    if (!articles || articles.length === 0) {
      return '📰 No tech news available at the moment.';
    }

    let newsText = '📰 *Latest Tech News:*\n\n';
    articles.forEach((article, index) => {
      newsText += `${index + 1}. *${article.title}*\n`;
      newsText += `   ${article.description || 'No description available.'}\n`;
      newsText += `   🔗 [Read more](${article.url})\n\n`;
    });

    return newsText;
  } catch (error) {
    console.error('NewsAPI Error:', error.response?.data || error.message);
    return '📰 Unable to fetch tech news right now. Please try again later.';
  }
}

/**
 * Main processing function
 */
async function processMessage(userMessage) {
  // Detect intent
  const intent = detectIntent(userMessage);
  console.log(`[Agent] Intent detected: ${intent}`);

  // Generate initial response
  const result = await generateResponse(userMessage, intent);

  // Execute action if needed
  if (result.action === 'CALL_GEMINI') {
    const geminiResponse = await callGeminiAPI(result.query);
    result.response = geminiResponse;
    result.action = 'NONE'; // Mark as processed
  } else if (result.action === 'CALL_NEWS_API') {
    const newsResponse = await callNewsAPI();
    result.response = newsResponse;
    result.action = 'NONE'; // Mark as processed
  }

  return result;
}

module.exports = {
  processMessage,
  AKSHAT_DATA
};
