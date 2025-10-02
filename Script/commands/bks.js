const axios = require("axios");

module.exports.config = {
 name: "bkashf",
 version: "1.0",
 hasPermssion: 0,
 credits: "ULLASH",
 description: "Create a fake Bkash screenshot",
 usePrefix: true,
 prefix: true,
 commandCategory: "Fun",
 usages: "<number> - <transaction ID> - <amount>",
 cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
 const input = args.join(" ");
 if (!input.includes("-")) {
 return api.sendMessage(
 `❌| Wrong format!\nUse: ${global.config.PREFIX}bkashf 017xxxxxxxx - TXN12345 - 1000`,
 event.threadID,
 event.messageID
 );
 }

 const [numberRaw, transactionRaw, amountRaw] = input.split("-");
 const number = numberRaw.trim();
 const transaction = transactionRaw.trim();
 const amount = amountRaw.trim();

 const url = `https://masterapi.site/api/bkashf.php?number=${encodeURIComponent(number)}&transaction=${encodeURIComponent(transaction)}&amount=${encodeURIComponent(amount)}`;

 api.sendMessage(
 `📤 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗻𝗴 𝗕𝗸𝗮𝘀𝗵 𝘀𝗰𝗿𝗲𝗲𝗻𝘀𝗵𝗼𝘁... 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 🕐`,
 event.threadID,
 (err, info) =>
 setTimeout(() => {
 api.unsendMessage(info.messageID);
 }, 4000)
 );

 try {
 const response = await axios.get(url, { responseType: "stream" });
 const attachment = response.data;

 api.sendMessage(
 {
 body: `📤 𝗬𝗼𝘂𝗿 𝗕𝗸𝗮𝘀𝗵 𝗿𝗲𝗰𝗲𝗶𝗽𝘁 𝗶𝘀 𝗿𝗲𝗮𝗱𝘆!\n\n━━━━━━━━━━━━━━━━━━\n\n🛠 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆: ─꯭─⃝‌‌𝐒ifu 💝\n━━━━━━━━━━━━━━━━━━`,
 attachment,
 },
 event.threadID,
 event.messageID
 );
 } catch (err) {
 console.error(err);
 api.sendMessage(
 "❌ An error occurred while generating the screenshot.",
 event.threadID,
 event.messageID
 );
 }
};
