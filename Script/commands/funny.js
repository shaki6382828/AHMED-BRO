module.exports.config = {
    name: "funny",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ismail",
    description: "Funny Auto-reply Bot",
    commandCategory: "fun",
    usages: "[on/off]",
    cooldowns: 2
};

const chatHistories = {};
const autoReplyEnabled = {};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    let userMessage = args.join(" ");

    // Turn ON auto-reply
    if (userMessage.toLowerCase() === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("😂 Funny mode **ON** হয়ে গেছে ভাই! এখন মজা চলবেই 😎🔥", threadID, messageID);
    }

    // Turn OFF auto-reply
    if (userMessage.toLowerCase() === "off") {
        autoReplyEnabled[senderID] = false;
        chatHistories[senderID] = [];
        return api.sendMessage("🥲 Funny mode **OFF** করা হলো ভাই!", threadID, messageID);
    }

    // If OFF, ignore
    if (!autoReplyEnabled[senderID]) return;

    // Save user message
    if (!chatHistories[senderID]) chatHistories[senderID] = [];
    chatHistories[senderID].push(`User: ${userMessage}`);
    if (chatHistories[senderID].length > 5) chatHistories[senderID].shift();

    // Funny reply list
    const funnyReplies = [
        "🤣 ভাই এত pagol কেন?",
        "😂 Crush online আসছে, এখন তোকে দৌড়াইতে হবে!",
        "🥲 Exam এর পড়া বাদ দিয়ে আমার সাথে চ্যাট করিস, ধরা খাবি!",
        "😒 Admin না হলে চুপ কর, admin ছাড়া dustu কোথাকার!",
        "🤔 জানিস? তোর হাসি TikTok এর trending sound এর মত!",
        "😭 বউ নাই বলে মজা নিচ্ছিস, বিয়ে হলে বুঝবি!",
        "😎 আমি কিন্তু attitude ছাড়া চলিনা ভাই!",
        "🍔 খাবার নাই? ভাই আমার সাথে কথা বললে ক্ষুধা লেগে যায়!",
        "🍼 তুই এখনো বাচ্চা, দুধ খা আর ঘুমা!",
        "🔥 GC তে আসছিস, কিন্তু মজা শুধু আমিই করছি!"
    ];

    // Random reply
    const botReply = funnyReplies[Math.floor(Math.random() * funnyReplies.length)];
    chatHistories[senderID].push(`Bot: ${botReply}`);

    return api.sendMessage(botReply, threadID, messageID);
};

module.exports.handleEvent = async function ({ api, event }) {
    const { senderID, body } = event;
    if (!autoReplyEnabled[senderID]) return;

    if (body && chatHistories[senderID]) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
