const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "dlvideo",
  version: "1.0",
  author: "Sifat",
  credits: "Sifat",
  description: "Download video from a direct video link",
  category: "media",
  usages: "[video link]",
  usePrefix: true,
};

module.exports.onStart = async function ({ api, event, args }) {
  const videoUrl = args[0];

  if (!videoUrl) {
    return api.sendMessage("❌ | Please give a video link!", event.threadID, event.messageID);
  }

  const filePath = path.join(__dirname, "cache", `video_${Date.now()}.mp4`);

  try {
    api.sendMessage("⏳ Downloading video, please wait...", event.threadID, event.messageID);

    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: "✅ Here is your video:",
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => fs.unlinkSync(filePath), // ✅ ফাইল পাঠানোর পর ডিলিট হয়ে যাবে
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ | Failed to download video.", event.threadID, event.messageID);
    });
  } catch (err) {
    console.error("Error:", err);
    api.sendMessage(`❌ | Error: ${err.message}`, event.threadID, event.messageID);
  }
};
