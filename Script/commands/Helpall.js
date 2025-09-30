const fs = require("fs");

// --- Font Conversion Functions ---

// Maps for 𝗔𝗕𝗖𝗗 font style (Bold Sans-Serif)
const boldSansMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
    'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
    'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
    'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭'
};

// Maps for 𝙰𝙱𝙲𝙳 font style (Monospace)
const monospaceMap = {
    'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐',
    'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗',
    'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞',
    'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
    'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶',
    'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽',
    'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄',
    'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉'
};

/**
 * Applies a specific font style to a string.
 * @param {string} text The text to convert.
 * @param {object} map The character map for the font.
 * @returns {string} The converted text.
 */
function applyFont(text, map) {
    return text.split('').map(char => map[char] || char).join('');
}


// --- Command Configuration ---

module.exports.config = {
  name: "help",
  version: "4.0.4", // Incremented version
  hasPermssion: 0,
  credits: "𝗦𝗛𝗜𝗙𝗔𝗧 ", // Acknowledged the changes
  description: "Dynamic Advanced Command List with custom fonts.",
  commandCategory: "system",
  usages: "help",
  cooldowns: 5,
};

// --- Main Command Logic ---

module.exports.run = async ({ api, event }) => {
  try {
    const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith(".js"));
    let commandCount = 0;
    let categories = {};

    for (const file of commandFiles) {
      try {
        const command = require(`${__dirname}/${file}`);
        if (!command || !command.config || !command.config.name || command.config.name === this.config.name) {
          continue;
        }

        const category = command.config.commandCategory
          ? command.config.commandCategory.toUpperCase()
          : "EXTRA";

        if (!categories[category]) {
          categories[category] = [];
        }

        // Apply monospace font to command names
        const commandNameWithFont = applyFont(command.config.name, monospaceMap);
        categories[category].push(`★${commandNameWithFont}`);
        commandCount++;

      } catch (e) {
        console.error(`❌ Failed to load command from file: ${file}: ${e.message}`);
      }
    }

    const sortedCategories = Object.keys(categories).sort();

    let msg = "╰────────✨⚡✨────────╯\n         ✨        𝐍𝐄𝐎𝐗⚡       ✨ \n╭────────✨⚡✨────────╮ \n\n\n\n";

    for (const cat of sortedCategories) {
      // Apply bold sans-serif font to category names
      const categoryNameWithFont = applyFont(cat, boldSansMap);
      msg += `╭────⚡${categoryNameWithFont}\n`;
      msg += "│\n│" + categories[cat].join(" ") + "\n\n";
    }

    msg += `╰───────────────⧕\n\n\n╭───『 ✨      𝐍𝐄𝐎𝐗⚡      ✨ 』\n╰──‣ 𝚃𝙾𝚃𝙰𝙻 𝙲𝙼𝙳 : ⚡${commandCount}✨\n‎╭────────✨⚡✨────────╮ \n╰──‣ 𝙱𝙾𝚃 : 𝐍𝐄𝐎𝐗⚡\n‎╭──‣ 𝙰𝙳𝙼𝙸𝙽 : 𝐀𝐇𝐌𝐄𝐃 𝐒𝐈𝐓𝐇𝐈𝐋⚡ \n╰────────✨⚡✨────────╯ `;

    api.sendMessage(msg, event.threadID, event.messageID);

  } catch (e) {
    console.error("❌ A critical error occurred in the help command:", e);
    api.sendMessage("❌ An unexpected error occurred while running the help command.", event.threadID, event.messageID);
  }
};
