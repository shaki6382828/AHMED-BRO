const os = require("os");

const startTime = new Date(); // সার্ভার শুরু হওয়ার সময়

module.exports = {
  config: {
    name: "uptime",
    version: "1.0.2",
    hasPermission: 0,
    credits: "Fixed by SHIFAT",
    description: "বটের আপটাইম এবং সিস্টেমের তথ্য দেখুন।",
    commandCategory: "box",
    usages: "uptime",
    prefix: "false",
    cooldowns: 5
  },

  run: async function ({ api, event }) {
    try {
      // প্রথমে লোডিং অ্যানিমেশন দেখানো হবে
      const loadingMessage = await displayLoading(api, event);

      // আপটাইম গণনা
      const uptimeInSeconds = Math.floor((new Date() - startTime) / 1000);
      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const secondsLeft = uptimeInSeconds % 60;
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      // সিস্টেমের তথ্য গণনা
      const totalMemoryGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMemoryGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);

      // চূড়ান্ত বার্তা তৈরি
      const systemInfo = `
♡  ∩_∩   （„• ֊ •„)♡
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

      // লোডিং বারকে সিস্টেমের তথ্য দিয়ে পরিবর্তন করা হবে
      await api.editMessage(systemInfo, loadingMessage.messageID);

    } catch (error) {
      console.error("সিস্টেমের তথ্য আনতে সমস্যা হয়েছে:", error);
      api.sendMessage(
        "সিস্টেমের তথ্য আনা সম্ভব হচ্ছে না।",
        event.threadID,
        event.messageID
      );
    }
  }
};

async function displayLoading(api, event) {
  // 10% দিয়ে প্রোগ্রেস বার শুরু
  const sentMessage = await api.sendMessage("[█░░░░░░░░░░] 10%", event.threadID);
  
  // messageID টি সরাসরি sentMessage অবজেক্ট থেকে নেওয়া হলো
  const mid = sentMessage.messageID;

  const steps = [
    { bar: "[███░░░░░░░░]", percent: "30%" },
    { bar: "[██████░░░░░]", percent: "60%" },
    { bar: "[█████████░░]", percent: "90%" },
    { bar: "[███████████]", percent: "100%" },
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // ১ সেকেন্ড অপেক্ষা
    try {
      if (mid) {
        await api.editMessage(`${step.bar} ${step.percent}`, mid);
      }
    } catch (error) {
      console.error("মেসেজ এডিট করতে সমস্যা:", error);
    }
  }

  return { messageID: mid };
}
