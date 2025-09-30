module.exports = {
  config: {
    name: "age",
    version: "2.1",
    author: "—͟͟͞͞𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    hasPermission: 0,
    commandCategory: "utility",
    cooldowns: 5,
    description: "Calculate age from birth date",
    usage: "[DD/MM/YYYY]",
    dependencies: {
      "moment-timezone": "",
      "fs-extra": "",
      "axios": ""
    }
  },

  run: async function ({ api, event, args }) {
    const fs = require("fs-extra");
    const moment = require("moment-timezone");
    const axios = require("axios");

    try {
      
      if (!args[0]) {
        return api.sendMessage("⚠️ Please provide your birth date in DD/MM/YYYY format\nExample: age 16/12/2006", event.threadID);
      }

      const input = args[0];
      const dateParts = input.split('/');
      
      if (dateParts.length !== 3) {
        return api.sendMessage("❌ Invalid date format. Please use DD/MM/YYYY", event.threadID);
      }

      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]);

      
      if (isNaN(day) || day < 1 || day > 31) {
        return api.sendMessage("❌ Invalid day (1-31)", event.threadID);
      }
      if (isNaN(month) || month < 1 || month > 12) {
        return api.sendMessage("❌ Invalid month (1-12)", event.threadID);
      }
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
        return api.sendMessage("❌ Invalid year", event.threadID);
      }

      
      const birthDate = moment.tz(`${year}-${month}-${day}`, "YYYY-MM-DD", "Asia/Dhaka");
      const now = moment.tz("Asia/Dhaka");
      
      if (birthDate.isAfter(now)) {
        return api.sendMessage("❌ You can't be born in the future!", event.threadID);
      }

      const duration = moment.duration(now.diff(birthDate));
      
      
      const years = duration.years();
      const months = duration.months();
      const days = duration.days();
      const totalMonths = years * 12 + months;
      const totalDays = Math.floor(duration.asDays());
      const totalHours = Math.floor(duration.asHours());
      const totalMinutes = Math.floor(duration.asMinutes());
      const totalSeconds = Math.floor(duration.asSeconds());

      
      const avatarPath = `${__dirname}/cache/${event.senderID}.jpg`;
      const avatarUrl = `https://graph.facebook.com/${event.senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const response = await axios.get(avatarUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(avatarPath);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      
      const message = {
        body: `┏━━━━━━━━━━━━━━━━❂
┃  💖 𝐀𝐆𝐄 𝐂𝐀𝐋𝐂𝐔𝐋𝐀𝐓𝐎𝐑 💖
┣━━━━━━━━━━━━━━━━❂
┃✦ 𝗗𝗔𝗧𝗘 𝗢𝗙 𝗕𝗜𝗥𝗧𝗛: ${day}/${month}/${year}
┃✦ 𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗔𝗚𝗘: ${years} 𝐘𝐄𝐀𝐑𝐒 ${months} 𝐌𝐎𝐍𝐓𝐇𝐒
┣━━━━[ 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 ]━━━━❂
┃❖ ${totalMonths} 𝐌𝐎𝐍𝐓𝐇𝐒
┃❖ ${totalDays} 𝐃𝐀𝐘𝐒
┃❖ ${totalHours} 𝐇𝐎𝐔𝐑𝐒
┣━━━━━━━━━━━━━━━━❂
┃     🌜 𝐍𝐄𝐎𝐗⚡ 🌛
┗━━━━━━━━━━━━━━━━❂`,
        attachment: fs.createReadStream(avatarPath)
      };

      await api.sendMessage(message, event.threadID);
      fs.unlinkSync(avatarPath);

    } catch (error) {
      console.error("Error in age command:", error);
      api.sendMessage("❌ An error occurred while processing your request", event.threadID);
    }
  }
};
