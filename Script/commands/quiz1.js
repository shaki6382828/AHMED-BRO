const axios = require("axios");

const getBaseApi = async () => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
    return res.data.mahmud;
  } catch (e) {
    console.error("Base API লোড করতে সমস্যা:", e);
    return null;
  }
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "1.0",
    author: "SHIFAT",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} [en/bn]"
    }
  },

  // কমান্ড রান করার ফাংশন
  run: async function ({ api, event, usersData, args }) {
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

      // কুইজ মেসেজ পাঠানো এবং onReply সেট করা
      api.sendMessage(quizMsg, event.threadID, (err, info) => {
        if (err) return console.error(err);

        global.GoatBot.onReply.set(info.messageID, {
          type: "quiz-reply",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswer
        });

        // 40 সেকেন্ড পর প্রশ্ন ডিলিট
        setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, 40000);
      }, event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("✨কুইজ লোড করতে সমস্যা হয়েছে, আবার চেষ্টা করো।", event.threadID, event.messageID);
    }
  },

  // Reply হ্যান্ডলার
  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author } = Reply;

    // নিশ্চিত করা যে উত্তরদাতা কুইজ শুরু করা ব্যক্তি
    if (event.senderID !== author) {
      return api.sendMessage("🤓এই কুইজ তোমার জন্য নয়।", event.threadID, event.messageID);
    }

    // মেসেজ আনসেন্ড করা
    await api.unsendMessage(Reply.messageID);
    const userAnswer = event.body.trim().toLowerCase();

    // উত্তর যাচাই করা
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
        `🫡সঠিক উত্তর!\nতুমি পেয়েছো ${rewardCoins} কয়েন এবং ${rewardExp} EXP 🎉`,
        event.threadID,
        event.messageID
      );
    } else {
      api.sendMessage(
        `🥱 ভুল উত্তর!\nসঠিক উত্তর ছিল: ${correctAnswer}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
