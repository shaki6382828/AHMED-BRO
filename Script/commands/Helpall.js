const fs = require("fs");

module.exports.config = {
  name: "help",
  version: "4.0.3", // Incremented version
  hasPermssion: 0,
  credits: "𝗦𝗛𝗜𝗙𝗔𝗧 (Fixed by Gemini)", // Acknowledged the fix
  description: "Dynamic Advanced Command List that skips broken commands.",
  commandCategory: "system",
  usages: "help",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  try {
    const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".js"));
    let commandCount = 0;
    let categories = {};

    for (const file of commandFiles) {
      // Wrap in a try-catch block to handle errors in other command files
      try {
        const command = require(`${__dirname}/${file}`);

        // Basic validation for the command object and its config
        if (!command || !command.config || !command.config.name) {
          console.log(`Skipping invalid command file: ${file}`);
          continue;
        }
        
        // Skip the help command itself
        if (command.config.name === this.config.name) {
            continue;
        }

        const category = command.config.commandCategory
          ? command.config.commandCategory.toUpperCase()
          : "𝗘𝗫𝗧𝗥𝗔";

        if (!categories[category]) {
          categories[category] = [];
        }

        categories[category].push(`★${command.config.name}`);
        commandCount++; // Increment count only for valid commands

      } catch (e) {
        // Log the error for the specific file but don't crash the help command
        console.error(`❌ Failed to load command from file: ${file}`);
        console.error(`Error details: ${e.message}`);
      }
    }

    // Sort categories alphabetically for a cleaner look
    const sortedCategories = Object.keys(categories).sort();

    let msg = "✨ [ ✨𝐇𝐈𝐍𝐀𝐓𝐀 ✨ 𝐖𝐎𝐑𝐋𝐃✨ ]\n\n";

    for (const cat of sortedCategories) {
      msg += `╭───× ${cat} ×───╮\n`;
      // Join commands and add a new line for better readability if the list is long
      msg += "│ " + categories[cat].join(" ") + "\n\n";
    }

    msg += `╰─────────────⧕
╭─『 ✨ 𝐇 𝐈 𝐍 𝐀 𝐓 𝐀 ✨ 』
╰‣ 𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳 : ✨${commandCount}✨
‎╭──────✨🎀✨──────╮ 
╰‣ 𝙱𝙾𝚃 : ✨𝐇𝐈𝐍𝐀𝐓𝐀✨
‎╭‣ 𝙰𝙳𝙼𝙸𝙽 : ✨𝐒𝐇𝐈𝐅𝐀𝐓✨
╰──────✨🎀✨──────╯ `;

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (e) {
    // This will catch any unexpected errors within the help command itself
    console.error("❌ A critical error occurred in the help command:", e);
    api.sendMessage("❌ An unexpected error occurred while running the help command.", event.threadID, event.messageID);
  }
};
