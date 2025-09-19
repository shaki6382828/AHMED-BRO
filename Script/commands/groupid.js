module.exports.config = {
  name: "groupid",
  version: "1.0.0",
  hasPermission: 0,
  credits: "SHIFAT",
  description: "গ্রুপের Thread ID বের করবে (শুধু গ্রুপে কাজ করবে)",
  commandCategory: "system",
  usages: "groupid",
  cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
  try {
    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);

    // শুধু গ্রুপে কাজ করবে
    if (threadInfo.isGroup) {
      const groupName = threadInfo.threadName || "Unnamed Group";
      api.sendMessage(
        `🆔 গ্রুপের নাম: ${groupName}\n📌 Thread ID: ${threadID}`,
        threadID
      );
    } else {
      api.sendMessage("❌ এই কমান্ড শুধু গ্রুপে ব্যবহার করা যাবে!", threadID);
    }
  } catch (e) {
    api.sendMessage("⚠️ গ্রুপের আইডি বের করতে সমস্যা হয়েছে!", event.threadID);
    console.error(e);
  }
};
