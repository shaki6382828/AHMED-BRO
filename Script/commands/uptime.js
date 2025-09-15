const moment = require("moment-timezone");

module.exports.config = {
  name: "uptime",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "Show bot uptime with animated progress bar",
  commandCategory: "system",
  usages: ",uptime",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  const time = process.uptime(); // কতক্ষণ চালু আছে সেকেন্ডে
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  let uptimeMsg = `🤖 BOT UPTIME:\n${hours}h ${minutes}m ${seconds}s\n\n`;

  // Progress bar animation
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5; // প্রতি ধাপে 5% করে বাড়বে
    if (progress > 100) progress = 100;

    const filled = "█".repeat(progress / 5);
    const empty = "░".repeat(20 - progress / 5);
    const bar = `[${filled}${empty}] ${progress}%`;

    api.editMessage(uptimeMsg + bar, event.messageID);

    if (progress === 100) clearInterval(interval);
  }, 500); // প্রতি 0.5 সেকেন্ডে আপডেট হবে
};
