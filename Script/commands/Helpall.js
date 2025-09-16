// help.js
// This module provides a dynamic, scalable, and fully asynchronous help command.
// It uses fs and request for maximum compatibility with bot environments.

const fs = require("fs-extra");
const request = require("request");

// --- Configuration for the command ---
module.exports.config = {
  name: "help",
  version: "2.1.0", // Updated version for the fix and improvement
  hasPermssion: 0,
  credits: "𝐒𝐈𝐅𝐀𝐓",
  description: "Displays all available commands categorized and sorted.",
  commandCategory: "system",
  usages: "[no args]",
  cooldowns: 5
};

/**
 * Executes the help command.
 * @param {Object} context - The command context object provided by the system.
 * @param {Function} context.api - The API object to send messages.
 * @param {Object} context.event - The event object.
 * @param {Object} context.global.client.commands - The global command map.
 */
module.exports.run = async function ({ api, event, global }) {
  const { threadID, messageID } = event;

  // --- Step 1: Data Structuring ---
  const categorizedCommands = {};
  const commands = global.client.commands;

  // Iterate over the global command map and categorize each command based on its 'commandCategory'.
  // This ensures a clean, automatically sorted help menu.
  for (const [name, commandData] of commands) {
    const category = commandData.config.commandCategory || 'uncategorized'; // Default category
    if (!categorizedCommands[category]) {
      categorizedCommands[category] = [];
    }
    categorizedCommands[category].push(name);
  }

  // Sort commands alphabetically within each category for a clean, consistent display.
  for (const category in categorizedCommands) {
    categorizedCommands[category].sort();
  }

  // --- Step 2: Dynamic Text Generation ---
  // Use a modern, readable template literal to build the main text body.
  let menuBody = '';
  for (const [category, cmds] of Object.entries(categorizedCommands)) {
    menuBody += `╭─────⭓ ${category.toUpperCase()}\n`;
    menuBody += cmds.map(cmd => `│✧${cmd}`).join('\n');
    menuBody += '\n╰────────────⭓\n\n';
  }

  // Create the final text body by combining header, menu, and footer.
  const finalText = `╔══❖💖𝐒𝐈𝐅𝐔 𝐂𝐌𝐃💖❖══╗
${menuBody}
╠═════♡ 💝💖💝 ♡═════╣
║ ❥ 𝙱𝙾𝚃: 𝐒𝐈𝐅𝐔 𝐁𝐎𝐓
║ ❥ 𝙲𝙴𝙾: 𝐌𝐃 𝐒𝐈𝐅𝐀𝐓
║ ❥ 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂: ${commands.size} 
╚═══════════════════╝`;

  // --- Step 3: Asynchronous Image Handling (using request) ---
  const backgrounds = [
    "https://i.imgur.com/K2Rgmw6.jpeg",
    "https://i.imgur.com/DYNNSbX.jpeg"
  ];
  const selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const imgPath = `${__dirname}/cache/helpallbg_${Date.now()}.jpg`;

  // Use a callback-based approach with `request` to ensure compatibility.
  request(selectedBg)
    .pipe(fs.createWriteStream(imgPath))
    .on("close", () => {
      // Send the message once the image is fully saved.
      api.sendMessage({
        body: finalText,
        attachment: fs.createReadStream(imgPath)
      }, threadID, (err, info) => {
        if (!err) {
          // Clean up the temporary file to save storage space.
          fs.unlinkSync(imgPath);
        } else {
          console.error("Error sending message with attachment:", err);
          // Fallback: Send only text if the image fails.
          api.sendMessage(finalText, threadID, messageID);
        }
      }, messageID);
    })
    .on("error", (err) => {
      console.error("Error downloading image:", err);
      // Fallback: Send only text if image download fails.
      api.sendMessage(finalText, threadID, messageID);
    });
};
