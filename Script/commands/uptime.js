const os = require("os");

const startTime = new Date(); // Server start time

module.exports = {
  config: {
    name: "uptime",
    version: "2.0.0",
    hasPermission: 0,
    credits: "SHIFAT (Animated Uptime)",
    description: "Check the bot uptime and system information with animation.",
    commandCategory: "box",
    usages: "uptime",
    prefix: "false",
    dependencies: {},
    cooldowns: 5
  },

  run: async function ({ api, event }) {
    try {
      // Show animated loading
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

      // Final message
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

      // Update final system info replacing last progress bar
      await api.editMessage(systemInfo, sentMessage.messageID);

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

// Function for animated progress bar
async function displayLoading(api, event) {
  const sentMessage = await api.sendMessage("[█░░░░░░░░░░] 10%", event.threadID);

  const steps = [
    { bar: "[███░░░░░░░░]", percent: "30%" },
    { bar: "[██████░░░░░]", percent: "60%" },
    { bar: "[█████████░░]", percent: "90%" },
    { bar: "[███████████]", percent: "100%" }
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
    try {
      await api.editMessage(`${step.bar} ${step.percent}`, sentMessage.messageID);
    } catch (err) {
      console.error("Edit failed:", err);
    }
  }

  return sentMessage; // return last message ID
}
