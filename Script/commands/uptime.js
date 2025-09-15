const os = require("os");

const startTime = new Date(); // Server start time

module.exports = {
  config: {
    name: "uptime",
    version: "3.0.0",
    hasPermission: 0,
    credits: "SHIFAT (Smooth Animated Uptime)",
    description: "Check the bot uptime and system information with smooth animation.",
    commandCategory: "box",
    usages: "uptime",
    prefix: "false",
    dependencies: {},
    cooldowns: 5
  },

  run: async function ({ api, event }) {
    try {
      // Show animated loading (returns message ID)
      const sentMessage = await displayLoading(api, event);

      // Calculate uptime
      const uptimeInSeconds = Math.floor((new Date() - startTime) / 1000);
      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const secondsLeft = uptimeInSeconds % 60;
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      // Calculate system information
      const totalMemoryGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMemoryGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);

      // Final message (pretty uptime info)
      const systemInfo = `
♡  ∩_∩
（„• ֊ •„)♡
╭─∪∪────────────⟡
│ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
├───────────────⟡
│ ⏰ 𝗥𝗨𝗡𝗧𝗜𝗠𝗘
│ ${uptimeFormatted}
│ 💻 𝗠𝗘𝗠𝗢𝗥𝗬
│ Total: ${totalMemoryGB} GB
│ Free: ${freeMemoryGB} GB
│ Used: ${usedMemoryGB} GB
╰───────────────⟡
`;

      // ছোট delay দিয়ে ফাইনাল রিপ্লেস
      setTimeout(() => {
        api.editMessage(systemInfo, sentMessage.messageID);
      }, 1000);

    } catch (error) {
      console.error("Error retrieving system information:", error);
      api.sendMessage(
        "Unable to retrieve system information.",
        event.threadID,
        event.messageID
      );
    }
  }
};

// Function for smooth progress animation
async function displayLoading(api, event) {
  // Start with empty progress
  const sentMessage = await api.sendMessage("[░░░░░░░░░░░░░░░░░░░░░░░░░] 0%", event.threadID);

  for (let percent = 5; percent <= 100; percent += 5) {
    await new Promise(resolve => setTimeout(resolve, 200)); // প্রতি স্টেপ 0.2s
    try {
      const barLength = 25; // progress bar size
      const filled = Math.floor((percent / 100) * barLength);
      const empty = barLength - filled;
      const bar = `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;

      await api.editMessage(bar, sentMessage.messageID);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  }

  return sentMessage; // return last message ID
}
