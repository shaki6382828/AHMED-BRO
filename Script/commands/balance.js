const usersData = require("./usersData.js");

module.exports.config = {
  name: "balance",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "তোমার কয়েন এবং EXP দেখাবে",
  commandCategory: "utility",
  usages: "",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  try {
    if (!event || !event.senderID) return console.log("❌ event.senderID পাওয়া যায়নি।");

    const user = usersData.get(event.senderID);
    const msg = `💰 তোমার কয়েন: ${user.coins}\n⭐ তোমার EXP: ${user.exp}`;

    if (api && api.sendMessage) api.sendMessage(msg, event.threadID, event.messageID);
    else console.log(msg);

  } catch (err) {
    console.error("❌ ব্যালেন্স দেখাতে সমস্যা হয়েছে:", err);
    if (api && api.sendMessage) api.sendMessage("❌ ব্যালেন্স দেখাতে সমস্যা হয়েছে।", event.threadID, event.messageID);
  }
};
