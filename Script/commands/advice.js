const axios = require("axios");

module.exports.config = {
  name: "advice",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "একটি র্যান্ডম উপদেশ পান, প্রেরণাদায়ক বা মজার।",
  commandCategory: "fun",
  usages: "[fun/inspire/life] (optional)",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    let category = args[0] ? args[0].toLowerCase() : null;

    // এখন মূল API কল
    const res = await axios.get("https://api.adviceslip.com/advice");
    let advice = res.data.slip.advice;

    // যদি category দেওয়া থাকে, তার সাথে একটু fun/random যোগ করা
    if (category) {
      switch(category) {
        case "fun":
          advice = "😂 মজার উপদেশ: " + advice;
          break;
        case "inspire":
          advice = "💡 প্রেরণাদায়ক উপদেশ: " + advice;
          break;
        case "life":
          advice = "🌱 জীবন সংক্রান্ত উপদেশ: " + advice;
          break;
        default:
          advice = "✨ উপদেশ: " + advice;
      }
    } else {
      advice = "✨ আজকের উপদেশ: " + advice;
    }

    // কাস্টম ফরম্যাট
    const adviceMsg = 
      `╭───✦ উপদেশ ✦───╮\n\n` +
      `  ${advice}\n\n` +
      `╰─────────────╯`;

    api.sendMessage(adviceMsg, event.threadID, event.messageID);

  } catch (error) {
    console.error("Advice API Error:", error);

    // fallback message
    const fallbackMsg =
      `╭───✦ উপদেশ ✦───╮\n\n` +
      `  দুঃখিত 😢, এই মুহূর্তে কোনো উপদেশ পাওয়া যাচ্ছে না।\n` +
      `  চেষ্টা করুন কিছুক্ষণ পরে।\n\n` +
      `╰─────────────╯`;
    api.sendMessage(fallbackMsg, event.threadID, event.messageID);
  }
};
