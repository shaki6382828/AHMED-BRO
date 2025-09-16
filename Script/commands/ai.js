const axios = require("axios");

// 🔴🔴🔴 ধাপ ৩: আপনার Gemini API Key এখানে যোগ করুন 🔴🔴🔴
// নিচের "" এর ভেতরে আপনার কপি করা API Key টি পেস্ট করুন।
const GEMINI_API_KEY = "AIzaSyABjIhqaAj5hxLmnPzeSuIPJ6fxVIKgIQ8";

// প্রতিটি থ্রেড (চ্যাট) অনুযায়ী মেমোরি রাখা হবে
const conversationMemory = new Map();

module.exports.config = {
  name: "ai",
  version: "2.0.0", // Stable Version
  hasPermssion: 0,
  credits: "SHIFAT & Gemini (Stable Version)",
  description: "AI chat using Google's reliable Gemini API.",
  commandCategory: "AI",
  usages: "[prompt]",
  cooldowns: 3,
};

// Gemini API থেকে উত্তর আনার জন্য ফাংশন
async function fetchFromGemini(history, threadID) {
  // Gemini-এর জন্য কথোপকথনের ফর্ম্যাট তৈরি করা
  const contents = history.map(turn => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.content }]
  }));

  // Gemini সবসময় শেষে ইউজারের প্রশ্ন আশা করে, তাই আগের মডেলের উত্তর বাদ দেওয়া হলো যদি থাকে
  if (contents.length > 1 && contents[contents.length - 1].role === 'model') {
    contents.pop();
  }

  try {
    console.log(`[AI] 🧠 ${threadID} - Gemini API ব্যবহার করে উত্তর খোঁজা হচ্ছে...`);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      { contents },
      { headers: { "Content-Type": "application/json" }, timeout: 60000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      console.log(`[AI] ✅ ${threadID} - Gemini API থেকে সফলভাবে উত্তর পাওয়া গেছে।`);
      return text.trim();
    } else {
      console.error(`[AI] ❌ ${threadID} - Gemini API থেকে কোনো উত্তর পাওয়া যায়নি। Response:`, response.data);
      return "দুঃখিত, আমি উত্তরটি ঠিকভাবে প্রসেস করতে পারিনি।";
    }

  } catch (error) {
    const errorMessage = error.response ? error.response.data.error.message : error.message;
    console.error(`[AI] ❌ ${threadID} - Gemini API তে সমস্যা হয়েছে:`, errorMessage);
    return `দুঃখিত, একটি সমস্যা হয়েছে। API Error: ${errorMessage}`;
  }
}

// মূল ফাংশন
module.exports.run = async function ({ api, event, args }) {
  // API Key সেট করা হয়েছে কিনা তা পরীক্ষা করা
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
    return api.sendMessage("❌ Gemini API Key সেট করা হয়নি!\n\nদয়া করে ai.js ফাইলের শুরুতে আপনার নিজের API Key যোগ করুন।\n\nKey পাওয়ার জন্য এখানে যান: https://aistudio.google.com/app/apikey", event.threadID, event.messageID);
  }

  try {
    const question = args.join(" ").trim();
    if (!question) {
      return api.sendMessage("❌ দয়া করে একটি প্রশ্ন লিখুন।\nউদাহরণ: ai বাংলাদেশের রাজধানীর নাম কি?", event.threadID, event.messageID);
    }
    
    console.log(`[AI] 💬 ${event.threadID} - নতুন প্রশ্ন: "${question}"`);

    api.sendTypingIndicator(event.threadID, true);
    const loadingMessage = await new Promise(resolve => {
      api.sendMessage("🤖 উত্তর তৈরি করছি...", event.threadID, (err, info) => {
        resolve(info || null);
      });
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

    // Gemini API থেকে উত্তর আনা
    let reply = await fetchFromGemini(history, event.threadID);

    api.sendTypingIndicator(event.threadID, false);
    
    if (loadingMessage) {
      api.unsendMessage(loadingMessage.messageID);
    }

    if (!reply) {
      return api.sendMessage("😅 দুঃখিত, Gemini API থেকে কোনো উত্তর পাওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।", event.threadID, event.messageID);
    }
    
    history.push({ role: "assistant", content: reply });
    api.sendMessage(reply, event.threadID, event.messageID);

  } catch (error) {
    console.error("[AI] Fatal Error:", error);
    api.sendTypingIndicator(event.threadID, false);
    api.sendMessage("⚠️ একটি অপ্রত্যাশিত সমস্যা হয়েছে। বিস্তারিত জানতে কনসোল চেক করুন।", event.threadID, event.messageID);
  }
};
