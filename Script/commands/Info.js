module.exports.config = {
 name: "info",
 version: "1.2.6",
 hasPermssion: 0,
 credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐈𝐬𝐥𝐚𝐦",
 description: "Bot information command",
 commandCategory: "For users",
 hide: true,
 usages: "",
 cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, Users, Threads }) {
 const { threadID } = event;
 const request = global.nodemodule["request"];
 const fs = global.nodemodule["fs-extra"];
 const moment = require("moment-timezone");

 const { configPath } = global.client;
 delete require.cache[require.resolve(configPath)];
 const config = require(configPath);

 const { commands } = global.client;
 const threadSetting = (await Threads.getData(String(threadID))).data || {};
 const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : config.PREFIX;

 const uptime = process.uptime();
 const hours = Math.floor(uptime / 3600);
 const minutes = Math.floor((uptime % 3600) / 60);
 const seconds = Math.floor(uptime % 60);

 const totalUsers = global.data.allUserID.length;
 const totalThreads = global.data.allThreadID.length;

 const msg = `╭⭓ ⪩ 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ⪨
│
├─ 🤖 ʙᴏᴛ ɴᴀᴍᴇ : 𝐒𝐈𝐅𝐔 𝐁𝐎𝐓
├─ ☢️ ᴘʀᴇғɪx : ${config.PREFIX}
├─ ♻️ ᴘʀᴇғɪx ʙᴏx : ${prefix}
├─ 🔶 ᴍᴏᴅᴜʟᴇs : ${commands.size}
├─ 🔰 ᴘɪɴɢ : ${Date.now() - event.timestamp}ms
│
╰───────⭓

╭⭓ ⪩ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ⪨
│
├─ 👑 ɴᴀᴍᴇ : 𝐌𝐃 𝐒𝐈𝐅𝐀𝐓
├─ 📲 ғʙ  :
│ facebook.com/100078859776449
├─ 💌 ᴍᴇssᴇɴɢᴇʀ :
│ m.me/100078859776449
├─ 📞 ᴡʜᴀᴛsᴀᴘᴘ :
│ wa.me/+8801964467614
│
╰───────⭓

╭⭓ ⪩ 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗜𝗘𝗦 ⪨
│
├─ ⏳ ᴀᴄᴛɪᴠ ᴛɪᴍᴇ : ${hours}h ${minutes}m ${seconds}s
├─ 📣 ɢʀᴏᴜᴘs : ${totalThreads}
├─ 🧿 ᴛᴏᴛᴀʟ ᴜsᴇʀs : ${totalUsers}
╰───────⭓

♥ 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 ♥
 ♥𝐒𝐈𝐅𝐔 𝐁𝐎𝐓♥`;

 const imgLinks = [
 "https:/i.imgur.com/K2Rgmw6.jpeg"
 ];

 const imgLink = imgLinks[Math.floor(Math.random() * imgLinks.length)];

 const callback = () => {
 api.sendMessage({
 body: msg,
 attachment: fs.createReadStream(__dirname + "/cache/info.jpg")
 }, threadID, () => fs.unlinkSync(__dirname + "/cache/info.jpg"));
 };

 return request(encodeURI(imgLink)).pipe(fs.createWriteStream(__dirname + "/cache/info.jpg")).on("close", callback);
};
