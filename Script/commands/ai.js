const axios = require("axios");

// প্রতিটি থ্রেড (চ্যাট) অনুযায়ী মেমোরি রাখা হবে
const conversationMemory = new Map();

// কনফিগারেশন
module.exports.config = {
  name: "ai",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "SHIFAT & Gemini (Improved)",
  description: "AI chat with improved memory management and response parsing.",
  commandCategory: "AI",
  usages: "[prompt]",
  cooldowns: 2,
};

// HuggingFace থেকে উত্তর আনার জন্য Helper ফাংশন
async function fetchFromHuggingFace(model, messages) {
  try {
    // আগের সব মেসেজ একত্রিত করে একটি প্রম্পট তৈরি করা হচ্ছে
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n") + "\nassistant:";

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: prompt },
      { headers: { "Content-Type": "application/json" }, timeout: 20000 }
    );

    let generatedText = response.data[0]?.generated_text?.trim();

    // 🟢 মূল উন্নতি: মডেলের উত্তর থেকে শুধু নতুন অংশটুকু বের করা
    // যদি মডেল পুরো প্রম্পটসহ উত্তর দেয়, তবে আমরা শুধু নতুন উত্তরটি নেব।
    if (generatedText && generatedText.startsWith(prompt)) {
      generatedText = generatedText.substring(prompt.length).trim();
    }
    
    // অনেক সময় মডেল উত্তরে "assistant:" অংশটি আবার যোগ করে, সেটি বাদ দেওয়া হলো
    if (generatedText && generatedText.toLowerCase().startsWith("assistant:")) {
        generatedText = generatedText.substring("assistant:".length).trim();
    }

    return generatedText;
  } catch (err) {
    console.error(`❌ ${model} failed:`, err.message);
    return null; // ব্যর্থ হলে null রিটার্ন করা হবে
  }
}

// মূল ফাংশন
module.exports.run = async function ({ api, event, args }) {
  try {
    const question = args.join(" ").trim();
    if (!question) {
      return api.sendMessage(
        "❌ দয়া করে একটি প্রশ্ন লিখুন।\nউদাহরণ: ai জীবনের মানে কি?",
        event.threadID,
        event.messageID
      );
    }

    // Typing Indicator এবং লোডিং মেসেজ পাঠানো
    api.sendTypingIndicator(event.threadID, true);
    const loadingMessage = await new Promise(resolve => {
      api.sendMessage("🤖 চিন্তা করছি...", event.threadID, (err, info) => {
        resolve(info || null);
      });
    });

    // পুরোনো কথোপকথন বের করা বা নতুন করে শুরু করা
    if (!conversationMemory.has(event.threadID)) {
      conversationMemory.set(event.threadID, []);
    }
    const history = conversationMemory.get(event.threadID);
    
    // 🟢 মেমোরি ম্যানেজমেন্ট: পুরোনো মেসেজ কেটে দিয়ে মেমোরি হালকা রাখা
    // এখানে শেষ ১০টি মেসেজ মনে রাখা হবে
    const MAX_HISTORY_LENGTH = 10;
    while (history.length > MAX_HISTORY_LENGTH) {
        history.shift(); // সবচেয়ে পুরোনো মেসেজ বাদ দেওয়া হলো
    }

    // ইউজারের প্রশ্ন মেমোরিতে যোগ করা
    history.push({ role: "user", content: question });

    let reply = null;

    // Primary Model: চেষ্টা করার জন্য একটি ভালো মডেল (যেমন Mistral)
    reply = await fetchFromHuggingFace("mistralai/Mistral-7B-Instruct-v0.2", history);

    // Fallback 1: BLOOM
    if (!reply) {
      console.log("Fallback to BLOOM...");
      reply = await fetchFromHuggingFace("bigscience/bloom", history);
    }

    // Fallback 2: GPT-2
    if (!reply) {
      console.log("Fallback to GPT-2...");
      reply = await fetchFromHuggingFace("gpt2", history);
    }

    // Typing Indicator বন্ধ করা
    api.sendTypingIndicator(event.threadID, false);
    
    // লোডিং মেসেজ ডিলিট করা
    if (loadingMessage) {
      api.unsendMessage(loadingMessage.messageID);
    }

    if (!reply) {
      return api.sendMessage(
        "😅 দুঃখিত, এখন কোনো উত্তর দিতে পারছি না। আবার চেষ্টা করুন।",
        event.threadID,
        event.messageID
      );
    }

    // AI-এর উত্তর মেমোরিতে যোগ করা
    history.push({ role: "assistant", content: reply });

    // Messenger-এর 2000 অক্ষরের লিমিট অনুযায়ী উত্তর ছোট করা
    const finalReply = reply.length > 2000 ? reply.substring(0, 2000) + "..." : reply;

    // ফাইনাল উত্তর পাঠানো
    api.sendMessage(finalReply, event.threadID, event.messageID);

  } catch (error) {
    console.error("AI command fatal error:", error);
    api.sendTypingIndicator(event.threadID, false);
    api.sendMessage("⚠️ কিছু একটা সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।", event.threadID, event.messageID);
  }
};
