const usersData = require("./usersData.js");

module.exports.config = {
  name: "balance",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "তোমার কয়েন এবং EXP দেখাবে",
  commandCategory: "utility",
  usages: "",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  try {
    const user = usersData.get(event.senderID);

    const msg = 
      `💰 তোমার কয়েন: ${user.coins}\n` +
      `⭐ তোমার EXP: ${user.exp}`;

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ ব্যালেন্স দেখাতে সমস্যা হয়েছে।", event.threadID, event.messageID);
  }
};
