const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
    name: "admin",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "ULLASH", //don't change my credit 
    description: "Show Owner Info",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    var time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    var callback = () => api.sendMessage({
        body: `
┏──────────────────┓
│──♥🄲🄴🄾 🄸🄽🄵🄾♥──  
┣──────────────────┫
│⚡𝐍𝐚𝐦𝐞    : ♥ 𝐬𝐡𝐢𝐟𝐚𝐭 ♥
│⚡𝐆𝐞𝐧𝐝𝐞𝐫    : 𝐌𝐚𝐥𝐞
│⚡𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧: 𝐈𝐧 𝐂𝐨𝐦𝐩𝐥𝐢𝐜𝐚𝐭𝐞𝐝
│⚡𝐀𝐠𝐞         : 18
│⚡𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : 𝐈𝐬𝐥𝐚𝐦
│⚡𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : 𝐊𝐡𝐮𝐥𝐧𝐚
└──────────────────┫

┌───────────────⭓
│. 💢 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 💢
├───────────────
│ 📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸:
│https://fb.com/100078859776449
│ 💬 msg admin 💬
└───────────────⭓

┌───────────────⭓
│ ❤️‍🩹 𝗨𝗽𝗱𝗮𝘁𝗲𝗱 𝗧𝗶𝗺𝗲 ❤️‍🩹
├───────────────
│ ⚡${time}⚡
└───────────────⭓
        `,
        attachment: fs.createReadStream(__dirname + "/cache/1.png")
    }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.png"));
  
    return request(encodeURI(`https://graph.facebook.com/100078859776449/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`))
        .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
        .on('close', () => callback());
};
