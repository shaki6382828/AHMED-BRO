const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
 name: "help",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐒𝐀𝐇𝐔",
 description: "Displays all available commands in one page",
 commandCategory: "system",
 usages: "[No args]",
 cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
 const { commands } = global.client;
 const { threadID, messageID } = event;

 const allCommands = [];

 for (let [name] of commands) {
 if (name && name.trim() !== "") {
 allCommands.push(name.trim());
 }
 }

 allCommands.sort();

 const finalText = `╔══❖💖𝐒𝐈𝐅𝐔 𝐂𝐌𝐃💖❖══╗
${allCommands.map(cmd => `║─꯭─⃝‌‌⚡${cmd}`).join("\n")}
╠═════♡ 💝💖💝 ♡═════╣
║ ❥ 𝙱𝙾𝚃: 𝐒𝐈𝐅𝐔 𝐁𝐎𝐓
║ ❥ 𝙲𝙴𝙾: 𝐌𝐃 𝐒𝐈𝐅𝐀𝐓
║ ❥ 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂: ${allCommands.length} 
╚═══════════════════╝`;

 
 const backgrounds = [
 "https://i.imgur.com/K2Rgmw6.jpeg",
  "https://i.imgur.com/DYNNSbX.jpeg"
 ];
 const selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
 const imgPath = __dirname + "/cache/helpallbg.jpg";

 const callback = () =>
 api.sendMessage({ body: finalText, attachment: fs.createReadStream(imgPath) }, threadID, () => fs.unlinkSync(imgPath), messageID);

 request(encodeURI(selectedBg))
 .pipe(fs.createWriteStream(imgPath))
 .on("close", () => callback());
};
