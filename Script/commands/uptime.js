const os = require("os");

const startTime = new Date(); // সার্ভার শুরু হওয়ার সময়

module.exports = {
  config: {
    name: "uptime",
    version: "1.0.5", // সংস্করণ আপডেট করা হলো
    hasPermission: 0, // 
    credits: "SHIFAT", // 𝗗𝗢𝗡𝗧 𝗖𝗛𝗔𝗡𝗚𝗘 𝗠𝗬 𝗖𝗥𝗘𝗗𝗜𝗧
    description: "বটের আপটাইম এবং সিস্টেমের তথ্য দেখুন।",
    commandCategory: "box",
    usages: "uptime",
    prefix: "false",
    cooldowns: 5
  },

  run: async function ({ api, event }) {
    try {
      // প্রথমে একটি লোডিং মেসেজ পাঠিয়ে তার আইডি নেওয়া হলো
      const messageID = (await api.sendMessage("⏳ | Uptime এবং সিস্টেমের তথ্য লোড হচ্ছে...", event.threadID)).messageID;

      // অ্যানিমেশনের ধাপগুলো একটি অ্যারে-তে রাখা হলো
      const animationSteps = [
        { text: "[██░░░░░░░░░] 17%\nপ্রসেসিং শুরু হচ্ছে...", delay: 700 },
        { text: "[████░░░░░░░] 48%\nআপটাইম গণনা করা হচ্ছে...", delay: 700 },
        { text: "[███████░░░░] 66%\nমেমোরির তথ্য সংগ্রহ করা হচ্ছে...", delay: 700 },
        { text: "[███████████] 99%\nসবকিছু গুছিয়ে আনা হচ্ছে...", delay: 800 } // শেষ ধাপে একটু বেশি সময়
      ];

      // লুপের মাধ্যমে অ্যানিমেশন দেখানো হলো
      for (const step of animationSteps) {
        // একটি নির্দিষ্ট সময় অপেক্ষা করা হবে
        await new Promise(resolve => setTimeout(resolve, step.delay));
        try {
          // মেসেজ এডিট করে অ্যানিমেশনের ধাপ দেখানো হবে
          await api.editMessage(step.text, messageID);
        } catch (e) {
          // যদি কোনো কারণে মেসেজ এডিট না করা যায়, তাহলে অ্যানিমেশন বন্ধ হয়ে যাবে
          // কিন্তু কোড চলা থামবে না
          console.error("অ্যানিমেশন মেসেজ এডিট করা সম্ভব হয়নি:", e);
          break;
        }
      }

      // আপটাইম এবং মেমোরির তথ্য গণনা করা
      const uptimeInSeconds = Math.floor((new Date() - startTime) / 1000);
      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const secondsLeft = uptimeInSeconds % 60;
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const totalMemoryGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMemoryGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const usedMemoryGB = (totalMemoryGB - freeMemoryGB).toFixed(2);

      // চূড়ান্ত বার্তা তৈরি করা
      const systemInfo = `
♡  ∩_∩                         ∩_∩  ♡
（„• ֊ •„)♡𝐍𝐄𝐎𝐗⚡♡(„• ֊ •„)
╭─∪∪─────────∪∪─⟡
│ ──꯭──⃝‌𝐍𝐄𝐎𝐗⚡𝐉𝐎𝐃───
├───────────────⟡
│ ✨ℝ𝕌ℕ𝕋𝕀𝕄𝔼
│ ${uptimeFormatted}
│ ✨ 𝕄𝔼𝕄𝕆ℝ𝕐
│ 𝚃𝙾𝚃𝙰𝙻: ${totalMemoryGB} 𝚃𝙱
│ 𝙵𝚁𝙴𝙴: ${freeMemoryGB} 𝚃𝙱
│ 𝚄𝚂𝙴𝙳: ${usedMemoryGB} 𝚃𝙱
╰───────────────⟡
`;
      
      // অ্যানিমেশনের শেষে, চূড়ান্ত তথ্য দেখানোর জন্য শেষবার মেসেজ এডিট করা
      // এখানে ১ সেকেন্ড অপেক্ষা করা হচ্ছে যাতে API 안정 হতে পারে
      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.editMessage(systemInfo, messageID);

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
