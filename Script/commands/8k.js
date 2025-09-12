const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// ⚠️ এখানে আপনার DeepAI API কী দেওয়া হয়েছে ⚠️
const DEEPAI_API_KEY = "2235c3a4-e429-46bb-861a-4f3459f72e62";

module.exports = {
  config: {
    name: "8k",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SIFAT",
    description: "Upscale an image to 8K resolution.",
    commandCategory: "Image",
    usages: "Reply to an image or provide a direct image URL",
    cooldowns: 5,
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const tempImagePath = path.join(__dirname, 'cache', `${threadID}_${messageID}_8k.png`);

    let imageUrl = event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0] 
      ? event.messageReply.attachments[0].url : args.join(" ");

    if (!imageUrl) {
      return api.sendMessage("অনুগ্রহ করে একটি ছবিতে রিপ্লাই করুন অথবা একটি ছবির URL দিন।", threadID, messageID);
    }

    try {
      api.sendMessage("আপনার ছবিটি 8K তে প্রসেসিং করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...", threadID, messageID);

      const response = await axios.post(
        "https://api.deepai.org/api/torch-srgan",
        { "image": imageUrl },
        { 
          headers: { 
            "api-key": DEEPAI_API_KEY,
            "Content-Type": "application/json"
          } 
        }
      );

      const upscaledImageUrl = response.data.output_url;
      if (!upscaledImageUrl) {
        throw new Error("আপস্কেলিংয়ের পর ছবির URL পাওয়া যায়নি।");
      }

      const upscaledImageResponse = await axios.get(upscaledImageUrl, { responseType: 'arraybuffer' });
      const upscaledImageBuffer = Buffer.from(upscaledImageResponse.data);

      await fs.outputFile(tempImagePath, upscaledImageBuffer);

      api.sendMessage({
        body: "✅ ছবিটি সফলভাবে 8K তে আপস্কেল করা হয়েছে!",
        attachment: fs.createReadStream(tempImagePath)
      }, threadID, () => fs.unlink(tempImagePath), messageID);

    } catch (error) {
      console.error(error);
      let errorMessage = "❌ ছবিটি আপস্কেল করার সময় একটি সমস্যা হয়েছে।";
      if (error.response && error.response.status === 401) {
        errorMessage = "❌ API কীটি সঠিক নয়। অনুগ্রহ করে আপনার API কী চেক করুন।";
      } else if (error.response && error.response.data && error.response.data.err) {
        errorMessage = `❌ API থেকে একটি সমস্যা এসেছে: ${error.response.data.err}`;
      }
      api.sendMessage(errorMessage, threadID, messageID);
    }
  }
};
        
