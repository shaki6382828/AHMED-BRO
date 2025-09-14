module.exports.config = {
 name: "pic",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "Shaon Ahmed",
 description: "Image search",
 commandCategory: "Search",
 usages: "[Text]",
 cooldowns: 0,
};
module.exports.run = async function({ api, event, args }) {
 const axios = require("axios");
 const fs = require("fs-extra");
 const request = require("request");
 const keySearch = args.join(" ");
 const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json')
 const Shaon = apis.data.noobs
 
 if(keySearch.includes("-") == false) return api.sendMessage('𝙿𝙻𝚉 𝙴𝙽𝚃𝙴𝚁 𝙸𝙽 𝚃𝙷𝙴 𝙵𝙾𝚁𝙼𝙰𝚃, 𝙴𝚇𝙰𝙼𝙿𝙻𝙴: pic boy-10 \n\n\n  ─꯭─⃝‌‌sʜɪғꫝ֟፝ؖ۬ᴛ✧', event.threadID, event.messageID)
 const keySearchs = keySearch.substr(0, keySearch.indexOf('-'))
 const numberSearch = keySearch.split("-").pop() || 6
 const res = await axios.get(`${Shaon}/pinterest?search=${encodeURIComponent(keySearchs)}`);
 const data = res.data.data;
 var num = 0;
 var imgData = [];
 for (var i = 0; i < parseInt(numberSearch); i++) {
 let path = __dirname + `/cache/${num+=1}.jpg`;
 let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer' })).data;
 fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
 imgData.push(fs.createReadStream(__dirname + `/cache/${num}.jpg`));
 }
 api.sendMessage({
 attachment: imgData,
 body: numberSearch + '✧sʜɪғꫝ֟፝ؖ۬ᴛ✧\n\n\n |°з°| ʀᴇsᴜʟᴛs ғᴏʀ ʏᴏᴜ. ʏᴏᴜʀ ᴋᴇʏᴡᴏʀᴅ: '+ keySearchs
 }, event.threadID, event.messageID)
 for (let ii = 1; ii < parseInt(numberSearch); ii++) {
 fs.unlinkSync(__dirname + `/cache/${ii}.jpg`)
 }
};
