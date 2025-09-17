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

// কুইজ সেশন ট্র্যাক করার জন্য একটি গ্লোবাল অবজেক্ট
if (!global.client.quizSessions) {
  global.client.quizSessions = {};
}

module.exports.config = {
  name: "quiz1",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "একাধিক প্রশ্নসহ একটি কুইজ সেশন খেলুন।",
  commandCategory: "game",
  usages: "[start/stop] [category en/bn] [rounds]",
  cooldowns: 10,
  envConfig: {
    rewardPerCorrect: 100, // প্রতিটি সঠিক উত্তরের জন্য কয়েন
    expPerCorrect: 20      // প্রতিটি সঠিক উত্তরের জন্য এক্সপি
  }
};

// একটি নির্দিষ্ট সেশনের জন্য প্রশ্ন জিজ্ঞাসা করার ফাংশন
async function askQuestion(api, event, session) {
  const { questions, currentQuestion, score } = session;
  const questionData = questions[currentQuestion];
  const { question, options, correctAnswer } = questionData;

  const quizMsg =
    ` प्रश्न ${currentQuestion + 1}/${questions.length} | স্কোর: ${score}\n` +
    `\n╭──✦ ${question}\n` +
    `├‣ 𝗔) ${options.a}\n` +
    `├‣ 𝗕) ${options.b}\n` +
    `├‣ 𝗖) ${options.c}\n` +
    `├‣ 𝗗) ${options.d}\n` +
    `╰──────────────────‣\n` +
    `আপনার উত্তর রিপ্লাই দিন।`;

  api.sendMessage(quizMsg, event.threadID, (err, info) => {
    if (err) return console.error(err);

    if (!global.client.handleReply) global.client.handleReply = [];
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      session: session, // পুরো সেশন অবজেক্ট পাস করা হচ্ছে
      correctAnswer: correctAnswer
    });
    // ৪০ সেকেন্ড পর স্বয়ংক্রিয়ভাবে প্রশ্নটি মুছে যাবে
    setTimeout(() => api.unsendMessage(info.messageID).catch(() => {}), 40000);
  }, event.messageID);
}

module.exports.run = async function({ api, event, args }) {
  const { senderID, threadID, messageID } = event;
  const action = (args[0] || "").toLowerCase();
  
  if (action === "start") {
    if (global.client.quizSessions[senderID]) {
      return api.sendMessage("❌ আপনি ইতিমধ্যেই একটি কুইজ সেশনে আছেন। শেষ করতে '/quiz stop' লিখুন।", threadID, messageID);
    }

    const category = (args[1] || "bn").toLowerCase() === "en" ? "english" : "bangla";
    let rounds = parseInt(args[2], 10) || 5;
    if (rounds > 15) rounds = 15; // সর্বোচ্চ রাউন্ড সংখ্যা ১৫

    api.sendMessage(`⏳ ${rounds} টি প্রশ্নের একটি কুইজ সেট তৈরি করা হচ্ছে...`, threadID, messageID);
    
    const baseApi = await getBaseApi();
    if (!baseApi) return api.sendMessage("❌ বেস API লোড হয়নি!", threadID, messageID);

    try {
      const questionPromises = [];
      for (let i = 0; i < rounds; i++) {
        questionPromises.push(axios.get(`${baseApi}/api/quiz?category=${category}`));
      }
      
      const responses = await Promise.all(questionPromises);
      const questions = responses.map(res => res.data);

      const session = {
        userId: senderID,
        questions: questions,
        currentQuestion: 0,
        score: 0
      };

      global.client.quizSessions[senderID] = session;
      await askQuestion(api, event, session);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ কুইজের প্রশ্ন লোড করতে সমস্যা হয়েছে!", threadID, messageID);
    }
  } else if (action === "stop") {
    if (global.client.quizSessions[senderID]) {
      delete global.client.quizSessions[senderID];
      api.sendMessage("✅ আপনার কুইজ সেশনটি বন্ধ করা হয়েছে।", threadID, messageID);
    } else {
      api.sendMessage("❌ আপনার কোনো চলমান কুইজ সেশন নেই।", threadID, messageID);
    }
  } else {
    api.sendMessage(
      "ℹ️ ব্যবহারবিধি:\n" +
      "» /quiz start [en/bn] [rounds] - নতুন কুইজ শুরু করুন।\n" +
      "» /quiz stop - চলমান কুইজ বন্ধ করুন।\n" +
      "উদাহরণ: /quiz start bn 5",
      threadID, messageID
    );
  }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { author, session, correctAnswer, messageID } = handleReply;
  const { senderID, threadID } = event;

  if (senderID !== author) {
    return api.sendMessage("❌ এটি আপনার কুইজ নয়।", threadID, event.messageID);
  }

  // পুরানো প্রশ্নটি মুছে দিন
  await api.unsendMessage(messageID).catch(() => {});

  const userAnswer = (event.body || "").trim().toLowerCase();
  const currentSession = global.client.quizSessions[senderID];

  if (!currentSession) {
    return api.sendMessage("❌ আপনার কুইজ সেশনটি শেষ হয়ে গেছে বা বন্ধ করা হয়েছে।", threadID, event.messageID);
  }
  
  // উত্তর চেক করা
  if (userAnswer === correctAnswer.toLowerCase()) {
    currentSession.score++;
    api.sendMessage(`✅ সঠিক উত্তর!`, threadID);
  } else {
    api.sendMessage(`❌ ভুল উত্তর!\nসঠিক উত্তর ছিল: ${correctAnswer}`, threadID);
  }

  currentSession.currentQuestion++;

  // কুইজ শেষ হয়েছে কিনা তা চেক করা
  if (currentSession.currentQuestion >= currentSession.questions.length) {
    const { score } = currentSession;
    const totalQuestions = currentSession.questions.length;
    
    const totalCoins = score * module.exports.config.envConfig.rewardPerCorrect;
    const totalExp = score * module.exports.config.envConfig.expPerCorrect;

    usersData.addCoins(senderID, totalCoins);
    usersData.addExp(senderID, totalExp);
    const user = usersData.get(senderID);

    const finalMsg = 
      `🎉 কুইজ শেষ! 🎉\n\n` +
      `ফলাফল: আপনি ${totalQuestions} টি প্রশ্নের মধ্যে ${score} টির সঠিক উত্তর দিয়েছেন।\n` +
      `আপনি পেয়েছেন:\n` +
      `💰 কয়েন: ${totalCoins}\n` +
      `⭐ EXP: ${totalExp}\n\n` +
      `আপনার বর্তমান ব্যালেন্স:\n` +
      `💰 মোট কয়েন: ${user.coins}\n` +
      `⭐ মোট EXP: ${user.exp}`;

    api.sendMessage(finalMsg, threadID, event.messageID);
    delete global.client.quizSessions[senderID]; // সেশন শেষ
  } else {
    // পরবর্তী প্রশ্ন করা
    await askQuestion(api, event, currentSession);
  }
};
    
