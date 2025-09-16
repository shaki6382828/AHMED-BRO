// help.js
// This module provides a dynamic, scalable, and fully asynchronous help command.
// It separates command data from the display logic, ensuring high maintainability.

// Core dependencies for asynchronous file and network operations.
const fs = require("fs-extra");
const axios = require("axios"); // Modern alternative to 'request' for HTTP requests

// --- Configuration for the command ---
module.exports.config = {
  name: "help",
  version: "2.0.0", // Updated version to reflect the new architecture
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
 * @param {Function} context.getLang - Function to get localized strings.
 */
module.exports.run = async function ({ api, event, global }) {
  const { threadID, messageID } = event;

  // --- Step 1: Data Structuring ---
  // Create a structured object to hold commands categorized by their 'commandCategory'.
  const categorizedCommands = {};
  const commands = global.client.commands;

  // Iterate over the global command map and categorize each command.
  for (const [name, commandData] of commands) {
    const category = commandData.config.commandCategory || 'uncategorized'; // Default category
    if (!categorizedCommands[category]) {
      categorizedCommands[category] = [];
    }
    categorizedCommands[category].push(name);
  }

  // Sort commands within each category for a clean, consistent display.
  for (const category in categorizedCommands) {
    categorizedCommands[category].sort();
  }

  // --- Step 2: Dynamic Text Generation ---
  // Use a modern, readable template literal to build the main text body.
  // The structure is dynamic, adapting to the available categories.
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

  // --- Step 3: Asynchronous Image Handling ---
  // A modern, robust way to fetch and handle the image.
  const backgrounds = [
    "https://i.imgur.com/K2Rgmw6.jpeg",
    "https://i.imgur.com/DYNNSbX.jpeg"
  ];
  const selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const imgPath = `${__dirname}/cache/helpallbg_${Date.now()}.jpg`; // Unique filename to prevent conflicts

  try {
    // Fetch the image using axios.
    const response = await axios({
      url: selectedBg,
      method: 'GET',
      responseType: 'stream'
    });

    // Save the image to the file system.
    const writer = fs.createWriteStream(imgPath);
    response.data.pipe(writer);

    // Wait for the file to finish writing before sending the message.
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Send the message with the text and the new attachment.
    await api.sendMessage(
      { body: finalText, attachment: fs.createReadStream(imgPath) },
      threadID,
      () => fs.unlinkSync(imgPath) // Clean up the file after sending
    );
  } catch (error) {
    console.error("Error handling image for help command:", error);
    // Fallback: Send only text if image fails to load.
    api.sendMessage(finalText, threadID, messageID);
  }
};
