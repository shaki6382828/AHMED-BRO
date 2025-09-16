const axios = require("axios");

// 🔴 আপনার Gemini API Key এখানে যোগ করা আছে, কোনো পরিবর্তনের প্রয়োজন নেই।
const GEMINI_API_KEY = "AIzaSyABjIhqaAj5hxLmnPzeSuIPJ6fxVIKgIQ8"; // আপনার আগের Key টি এখানে থাকবে

// প্রতিটি থ্রেড (চ্যাট) অনুযায়ী মেমোরি রাখা হবে
const conversationMemory = new Map();

module.exports.config = {
  name: "ai",
  version: "2.1.0", // More Resilient Version
  hasPermssion: 0,
  credits: "Ariyan & Gemini (Auto-Retry & Fallback)",
  description: "AI chat with auto-retry logic and a fallback model to handle server overload.",
  commandCategory: "AI",
  usages: "[prompt]",
  cooldowns: 3,
};

/**
 * একটি নির্দিষ্ট মডেলের জন্য নির্দিষ্ট সংখ্যকবার আবার চেষ্টা করার লজিক
 * @param {string} model - ব্যবহার করার জন্য মডেলের নাম
 * @param {Array} history - কথোপকথনের ইতিহাস
 * @param {string} threadID - বর্তমান থ্রেডের আইডি
 * @returns {Promise<string|null>} - সফল হলে AI-এর উত্তর, না হলে null
 */
async function fetchWithRetry(model, history, threadID) {
  const MAX_RETRIES = 3;
  let delay = 2000; // ২ সেকেন্ড দিয়ে শুরু

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI] 🧠 ${threadID} - মডেল '${model}' ব্যবহার করে চেষ্টা #${attempt}`);
      
      const contents = history.map(turn => ({
        role: turn.role === "user" ? "user" : "model",
        parts: [{ text: turn.content }]
      }));

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        { contents },
        { headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[AI] ✅ ${threadID} - মডেল '${model}' থেকে সফলভাবে উত্তর পাওয়া গেছে।`);
        return text.trim();
      }
    } catch (error) {
      const isOverloaded = error.response && (error.response.status === 429 || error.response.status === 503);
      
      if (isOverloaded && attempt < MAX_RETRIES) {
        console.warn(`[AI] ⚠️ ${threadID} - মডেল '${model}' ওভারলোড। ${delay / 1000} সেকেন্ড পর আবার চেষ্টা করা হচ্ছে...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // পরেরবার দ্বিগুণ সময় অপেক্ষা করবে
      } else {
        const errorMessage = error.response ? error.response.data.error.message : error.message;
        console.error(`[AI] ❌ ${threadID} - মডেল '${model}' চূড়ান্তভাবে ব্যর্থ হয়েছে:`, errorMessage);
        return null; // অন্য কোনো এরর হলে বা সর্বোচ্চ চেষ্টা শেষ হলে null রিটার্ন করবে
      }
    }
  }
  return null;
}

// মূল ফাংশন
module.exports.run = async function ({ api, event, args }) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
    return api.sendMessage("❌ Gemini API Key সেট করা হয়নি!\n\nদয়া করে ai.js ফাইলের শুরুতে আপনার নিজের API Key যোগ করুন।", event.threadID, event.messageID);
  }

  try {
    const question = args.join(" ").trim();
    if (!question) {
      return api.sendMessage(" ♡  ∩_∩                         ∩_∩  ♡\n（„• ֊ •„)♡sʜɪғꫝ֟፝ؖ۬ᴛ ꫝ֟፝ؖ۬ɪ(„• ֊ •„) \n⟡─∪∪─────────∪∪───⟡\n│─𝙷𝙾𝚆 𝙲𝙰𝙽 𝙸 𝙷𝙴𝙻𝙿 𝚄 𝚂𝙸𝚁─│ \n⟡─────────────────⟡\n│(¬◡¬)✧    (¬◡¬)✧    (¬◡¬)✧│ \n⟡─────────────────⟡", event.threadID, event.messageID);
    }
    
    api.sendTypingIndicator(event.threadID, true);
    const loadingMessage = await new Promise(resolve => {
      api.sendMessage(" ⟡───────⟡───────⟡\njust a second......\n⟡───────⟡───────⟡", event.threadID, (err, info) => resolve(info || null));
    });

    if (!conversationMemory.has(event.threadID)) {
      conversationMemory.set(event.threadID, []);
    }
    const history = conversationMemory.get(event.threadID);
    
    const MAX_HISTORY_LENGTH = 10;
    while (history.length > MAX_HISTORY_LENGTH) {
      history.shift();
    }

    history.push({ role: "user", content: question });

    // ধাপ ১: প্রথমে 'gemini-1.5-flash-latest' মডেল চেষ্টা করা হবে
    let reply = await fetchWithRetry('gemini-1.5-flash-latest', history, event.threadID);

    // ধাপ ২: যদি প্রথম মডেল ব্যর্থ হয়, তবে 'gemini-pro' মডেল চেষ্টা করা হবে
    if (!reply) {
      console.log(`[AI] 🔄 ${event.threadID} - মূল মডেল ব্যর্থ। ফলব্যাক মডেল 'gemini-pro' ব্যবহার করা হচ্ছে...`);
      reply = await fetchWithRetry('gemini-pro', history, event.threadID);
    }

    api.sendTypingIndicator(event.threadID, false);
    if (loadingMessage) api.unsendMessage(loadingMessage.messageID);

    if (!reply) {
      return api.sendMessage("🫡দুঃখিত, এই মুহূর্তে সার্ভার ব্যস্ত থাকায় উত্তর দেওয়া সম্ভব হচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
    
    history.push({ role: "assistant", content: reply });
    api.sendMessage(reply, event.threadID, event.messageID);

  } catch (error) {
    console.error("[AI] Fatal Error:", error);
    api.sendTypingIndicator(event.threadID, false);
    api.sendMessage("⚠️ একটি অপ্রত্যাশিত সমস্যা হয়েছে। বিস্তারিত জানতে কনসোল চেক করুন।", event.threadID, event.messageID);
  }
};
