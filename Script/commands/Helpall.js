const moment = require("moment-timezone");

module.exports.config = {
  name: "help",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "SHIFAT",
  description: "Show bot command list in stylish decorated format",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 1,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 60
  }
};

module.exports.run = function ({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  // নির্দিষ্ট কমান্ডের info চাইলে
  const command = commands.get((args[0] || "").toLowerCase());
  if (command) {
    return api.sendMessage(
      `✨ [ Command Info ]\n\n` +
      `📌 Name: ${command.config.name}\n` +
      `📝 Description: ${command.config.description}\n` +
      `⚙️ Usage: ${prefix}${command.config.name} ${command.config.usages || ""}\n` +
      `📂 Category: ${command.config.commandCategory}\n` +
      `⏳ Cooldown: ${command.config.cooldowns}s\n` +
      `🔑 Permission: ${(command.config.hasPermssion == 0) ? "User" : (command.config.hasPermssion == 1) ? "Admin Group" : "Admin Bot"}\n` +
      `👨‍💻 Credits: ${command.config.credits}`,
      threadID,
      messageID
    );
  }

  // সব কমান্ড ক্যাটাগরি অনুযায়ী সাজানো
  const categories = {};
  for (const [name, value] of commands) {
    const cat = value.config.commandCategory || "Other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
  }

  for (const cat in categories) {
    categories[cat].sort((a, b) => a.localeCompare(b));
  }

  // ফ্যান্সি help menu
  let msg = `✨ [ 𝐆𝐮𝐢𝐝𝐞 𝐅𝐨𝐫 𝐁𝐞𝐠𝐢𝐧𝐧𝐞𝐫𝐬 ] ✨\n\n`;
  msg += `╭───★ 𝐂𝐌𝐃 𝐋𝐈𝐒𝐓 ★───╮\n`;
  msg += `│ ✨ 𝐇 𝐈 𝐍 𝐀 𝐓 𝐀 ✨\n│\n`;

  for (const cat in categories) {
    msg += `│ ───× \n`;
    msg += `│ 📂 ${cat.toUpperCase()}\n`;
    msg += `│ ${categories[cat].map(cmd => `★${cmd}`).join(" ")}\n`;
    msg += `│\n`;
  }

  msg += `╰──────────────⧕\n`;
  msg += `╭─『 ✨ 𝐇 𝐈 𝐍 𝐀 𝐓 𝐀 ✨ 』\n`;
  msg += `╰‣ 📊 Total Commands: ${commands.size}\n`;
  msg += `╰‣ 🌐 A Facebook Bot\n`;
  msg += `╰‣ 👑 CEO : —͟͟͞͞sʜɪғꫝ֟፝ؖ۬ᴛ ✿🧃🐣\n`;
  msg += `╰‣ 🛡️ ADMIN: —͟͟͞͞sʜɪғꫝ֟፝ؖ۬ᴛ ✿\n`;
  msg += `╰‣ 📞 Report Issue: ${prefix}callad <ADMIN>\n`;
  msg += `╰‣ ⏰ Time: ${moment.tz("Asia/Dhaka").format("HH:mm:ss, DD MMMM YYYY")}`;

  return api.sendMessage(msg, threadID, async (error, info) => {
    if (autoUnsend) {
      await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
      return api.unsendMessage(info.messageID);
    }
  }, messageID);
};
