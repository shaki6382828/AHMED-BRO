const axios = require("axios");

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
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "Random quiz খেলো",
  commandCategory: "game",
  usages: "[en/bn]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, usersData }) {
  try {
    const input = (args[0] || "").toLowerCase();
    const category = input === "en" || input === "english" ? "english" : "bangla";

    const baseApi = await getBaseApi();
    if (!baseApi) {
      return api.sendMessage("❌ বেস API লোড হয়নি!", event.threadID, event.messageID);
    }

    const res = await axios.get(`${baseApi}/api/quiz?category=${category}`);
    const quiz = res.data;

    if (!quiz) {
      return api.sendMessage("❌ এই ক্যাটাগরির জন্য কোনো Quiz পাওয়া যায়নি।", event.threadID, event.messageID);
    }

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

      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        correctAnswer
      });

      // 40 সেকেন্ড পর প্রশ্ন ডিলিট
      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 40000);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ কুইজ লোড করতে সমস্যা হয়েছে, আবার চেষ্টা করো।", event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply, usersData }) {
  const { correctAnswer, author } = handleReply;

  if (event.senderID !== author) {
    return api.sendMessage("❌ এই কুইজ তোমার জন্য নয়।", event.threadID, event.messageID);
  }

  await api.unsendMessage(handleReply.messageID);
  const userAnswer = event.body.trim().toLowerCase();

  if (userAnswer === correctAnswer.toLowerCase()) {
    const rewardCoins = 500;
    const rewardExp = 100;

    const userData = await usersData.get(author);
    await usersData.set(author, {
      money: userData.money + rewardCoins,
      exp: userData.exp + rewardExp,
      data: userData.data
    });

    api.sendMessage(
      `✅ সঠিক উত্তর!\nতুমি পেয়েছো ${rewardCoins} কয়েন এবং ${rewardExp} EXP 🎉`,
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
