const axios = require("axios");
const usersData = require("./usersData.js");

async function getBaseApi() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
    return res.data.mahmud;
  } catch (e) {
    console.error("Base API লোড করতে সমস্যা:", e);
    return null;
  }
}

module.exports.config = {
  name: "quiz",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "Random quiz খেলো",
  commandCategory: "game",
  usages: "[en/bn]",
  cooldowns: 5,
  envConfig: {
    rewardCoins: 500,
    rewardExp: 100
  }
};

// মূল কুইজ রান ফাংশন
module.exports.run = async function ({ api, event, args }) {
  if (!global.client) global.client = {};
  if (!global.client.handleReply) global.client.handleReply = [];

  try {
    const input = (args[0] || "").toLowerCase();
    const category = input === "en" || input === "english" ? "english" : "bangla";

    const baseApi = await getBaseApi();
    if (!baseApi) return api.sendMessage("❌ বেস API লোড হয়নি!", event.threadID, event.messageID);

    const res = await axios.get(`${baseApi}/api/quiz?category=${category}`);
    const quiz = res.data;
    if (!quiz) return api.sendMessage("❌ Quiz পাওয়া যায়নি!", event.threadID, event.messageID);

    const { question, correctAnswer, options } = quiz;
    const { a, b, c, d } = options;

    const quizMsg =
      `\n╭──✦ ${question}\n` +
      `├‣ 𝗔) ${a}\n` +
      `├‣ 𝗕) ${b}\n` +
      `├‣ 𝗖) ${c}\n` +
      `├‣ 𝗗) ${d}\n` +
      `╰──────────────────‣\n` +
      `𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.`;

    api.sendMessage(quizMsg, event.threadID, (err, info) => {
      if (err) return console.error(err);

      // handleReply যোগ করা
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        correctAnswer
      });

      // 40 সেকেন্ড পরে মেসেজ আনসেন্ড
      setTimeout(() => api.unsendMessage(info.messageID).catch(() => {}), 40000);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ কুইজ লোড করতে সমস্যা হয়েছে!", event.threadID, event.messageID);
  }
};

// handleReply ফাংশন
module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { correctAnswer, author, messageID } = handleReply;

  if (event.senderID !== author) {
    return api.sendMessage("❌ এই কুইজ তোমার জন্য নয়।", event.threadID, event.messageID);
  }

  await api.unsendMessage(messageID).catch(() => {});
  const userAnswer = (event.body || "").trim().toLowerCase();

  const rewardCoins = module.exports.config.envConfig.rewardCoins;
  const rewardExp = module.exports.config.envConfig.rewardExp;

  if (userAnswer === correctAnswer.toLowerCase()) {
    usersData.addCoins(event.senderID, rewardCoins);
    usersData.addExp(event.senderID, rewardExp);

    const user = usersData.get(event.senderID);
    api.sendMessage(
      `✅ সঠিক উত্তর!\nতুমি পেয়েছো ${rewardCoins} কয়েন এবং ${rewardExp} EXP 🎉\nবর্তমান ব্যালেন্স:\n💰 কয়েন: ${user.coins}\n⭐ EXP: ${user.exp}`,
      event.threadID,
      event.messageID
    );
  } else {
    api.sendMessage(
      `❌ ভুল উত্তর!\nসঠিক উত্তর ছিল: ${correctAnswer}`,
      event.threadID,
      event.messageID
    );
  }
};
