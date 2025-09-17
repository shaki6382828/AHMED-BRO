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

module.exports.run = async function ({ api, event, args }) {
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

      setTimeout(() => {
        api.unsendMessage(info.messageID);
      }, 40000);
    }, event.messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ কুইজ লোড করতে সমস্যা হয়েছে, আবার চেষ্টা করো।", event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { correctAnswer, author } = handleReply;

  if (event.senderID !== author) {
    return api.sendMessage("❌ এই কুইজ তোমার জন্য নয়।", event.threadID, event.messageID);
  }

  await api.unsendMessage(handleReply.messageID);
  const userAnswer = event.body.trim().toLowerCase();

  const { rewardCoins, rewardExp } = module.exports.config.envConfig;

  if (userAnswer === correctAnswer.toLowerCase()) {
    // ✅ এখানে কয়েন/EXP বাড়ানোর লজিক বসাও
    // 👉 তোমার বটে যেভাবে কয়েন/EXP অ্যাড হয় সেই ফাংশন বসাও
    // উদাহরণ:
    // await Currencies.increaseMoney(event.senderID, rewardCoins);
    // await Currencies.increaseExp(event.senderID, rewardExp);

    api.sendMessage(
      `✅ সঠিক উত্তর!\nতুমি পেয়েছো ${rewardCoins} কয়েন এবং ${rewardExp} EXP 🎉\n\n✨`,
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
