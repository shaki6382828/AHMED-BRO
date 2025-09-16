const moment = require("moment-timezone");

module.exports.config = {
  name: "help",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "SHIFAT", // 🄳🄾🄽🅃 🄲🄷🄰🄽🄶🄴 🄼🅈 🄲🅁🄴🄳🄸🅃😒
  description: "Show bot command list by category",
  commandCategory: "system",
  usages: "[command name]",
  cooldowns: 1,
  envConfig: {
    autoUnsend: false,
    delayUnsend: 60
  }
};

module.exports.languages = {
  "en": {
    "moduleInfo": "「 %1 」\n%2\n\n❯ Usage: %3\n❯ Category: %4\n❯ Cooldown: %5s\n❯ Permission: %6\n\n» Module code by %7 «",
    "helpList": '[ There are %1 commands in this bot, use: "%2help nameCommand" to know more! ]',
    "user": "User",
    "adminGroup": "Admin group",
    "adminBot": "Admin bot"
  }
};

module.exports.run = function ({ api, event, args, getText }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const { autoUnsend, delayUnsend } = global.configModule[this.config.name];
  const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

  // যদি specific command চাই
  const command = commands.get((args[0] || "").toLowerCase());
  if (command) {
    return api.sendMessage(
      getText("moduleInfo",
        command.config.name,
        command.config.description,
        `${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}`,
        command.config.commandCategory,
        command.config.cooldowns,
        ((command.config.hasPermssion == 0) ? getText("user") : (command.config.hasPermssion == 1) ? getText("adminGroup") : getText("adminBot")),
        command.config.credits
      ),
      threadID,
      messageID
    );
  }

  // সব command ক্যাটাগরি অনুযায়ী সাজানো
  const categories = {};
  for (const [name, value] of commands) {
    const cat = value.config.commandCategory || "Other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(name);
  }

  // সাজানো
  for (const cat in categories) {
    categories[cat].sort((a, b) => a.localeCompare(b));
  }

  let msg = " ♡   ∩_∩                            ∩_∩   ♡\n  （„• ֊ •„) ♡ sʜɪғꫝ֟፝ؖ۬ᴛ  ♡ („• ֊ •„) \n⟡──∪∪──────────∪∪───⟡\n│✨────꯭─⃝‌‌𝗦𝗜𝗙𝗨 𝗖𝗠𝗗────✨│\n ⟡───────────────────⟡\n│\n\n";

  for (const cat in categories) {
    msg += `✿ 『 ${cat.toUpperCase()} 』 ✿\n`;
    msg += "✦✦ " + categories[cat].join(" ✦✦ ") + "\n";
    msg += "✦♡••┈┈┈┈┈┈┈┈┈┈┈┈••♡✦\n\n";
  }

  msg += `✨𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳: ${commands.size}\n`;
  msg += `✨𝚄𝚂𝙴: ${prefix}help [command]\n\n`;
  msg += `✦••••┈┈┈┈┈┈┈┈••••✦\n『 🎀 𝐒𝐇𝐈𝐅𝐀𝐓_𝐁𝐎𝐓 🎀 』\n✦••••┈┈┈┈┈┈┈┈••••✦`;

  return api.sendMessage(msg, threadID, async (error, info) => {
    if (autoUnsend) {
      await new Promise(resolve => setTimeout(resolve, delayUnsend * 1000));
      return api.unsendMessage(info.messageID);
    }
  }, messageID);
};
