const fs = require("fs");

module.exports.config = {
  name: "help",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "𝗦𝗛𝗜𝗙𝗔𝗧",
  description: "Dynamic Advanced Command List",
  commandCategory: "system",
  usages: "help",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  // সব কমান্ড ফাইল লোড
  const commandFiles = fs.readdirSync(__dirname + "/").filter(f => f.endsWith(".js"));

  let categories = {};

  for (let file of commandFiles) {
    if (file === "menu.js") continue; // menu নিজেকে বাদ দিচ্ছে
    const command = require(__dirname + "/" + file);
    const cat = command.config.commandCategory?.toUpperCase() || "𝗘𝗫𝗧𝗥𝗔";

    if (!categories[cat]) categories[cat] = [];
    categories[cat].push("✦" + command.config.name);
  }

  // সুন্দর ফরম্যাটে বানানো
  let msg = "✨ [ ✨𝐇𝐈𝐍𝐀𝐓𝐀 ✨ 𝐖𝐎𝐑𝐋𝐃✨ ]\n\n";

  for (let cat in categories) {
    msg += `╭───× ${cat} ×───╮\n`;
    msg += "│ " + categories[cat].join(" ") + "\n\n";
  }

  msg += `╰─────────────⧕
╭─『 ✨ 𝐇 𝐈 𝐍 𝐀 𝐓 𝐀 ✨ 』
╰‣ 𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳 : ✨${commandFiles.length - 1}✨
‎╭──────✨🎀✨──────╮ 
╰‣ 𝙱𝙾𝚃 : ✨𝐇𝐈𝐍𝐀𝐓𝐀✨
‎╭‣ 𝙰𝙳𝙼𝙸𝙽 : ✨𝐒𝐇𝐈𝐅𝐀𝐓✨
╰──────✨🎀✨──────╯ `;

  api.sendMessage(msg, event.threadID, event.messageID);
};
