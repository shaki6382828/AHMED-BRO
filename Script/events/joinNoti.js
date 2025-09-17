module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝐌_ ☢️",
    description: "Notification of bots or people entering groups with random gif/photo/video",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "pidusage": "",
        "axios": "" // PNG লোডের জন্য
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const path = join(__dirname, "cache", "joinvideo");
    if (existsSync(path)) mkdirSync(path, { recursive: true });

    const path2 = join(__dirname, "cache", "joinvideo", "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });

    return;
}

module.exports.run = async function({ api, event }) {
    const { threadID } = event;
    const axios = global.nodemodule["axios"];
    const fs = global.nodemodule["fs-extra"];
    const path = require("path");

    // যদি বটকে এড করে
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? " " : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
        
        return api.sendMessage({
            body: ` ✨𝚃𝙷𝙰𝙽𝙺𝚂 𝙵𝙾𝚁 𝙰𝙳𝙳𝙸𝙽𝙶 𝙼𝙴 🫲🏻🐸🫱🏻`
        }, threadID);
    } 
    else {
        try {
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const threadData = global.data.threadData.get(parseInt(threadID)) || {};

            var mentions = [], nameArray = [], memLength = [], i = 0;
            
            for (id in event.logMessageData.addedParticipants) {
                const userName = event.logMessageData.addedParticipants[id].fullName;
                nameArray.push(userName);
                mentions.push({ tag: userName, id });
                memLength.push(participantIDs.length - i++);
            }
            memLength.sort((a, b) => a - b);

            (typeof threadData.customJoin == "undefined") ? msg = "✨════════════════════✨ \n  𝙰𝚂𝚂𝙰𝙻𝙰𝙼𝚄 𝙰𝙻𝙰𝙸𝙺𝚄𝙼 \n ✨════════════════════✨ \n\n ✨𝚆𝙴𝙻𝙲𝙾𝙼𝙴✨ \n\n ✿✿ \n [ {name} ] \n ✿✿ \n\n 𝙰𝙿𝙽𝙰𝙺𝙴 𝙰𝙼𝙰𝙳𝙴𝚁 \n\n ✨{threadName}✨\n 𝙶𝚁𝙾𝚄𝙿𝙴 \n\n 𝙰𝙿𝙽𝙸 {soThanhVien} 𝙽𝙾. 𝙼𝙴𝙼𝙱𝙴𝚁 \n\n ✨════════════════════✨ " : msg = threadData.customJoin;
            
            msg = msg
                .replace(/\{name}/g, nameArray.join(', '))
                .replace(/\{type}/g, (memLength.length > 1) ?  'Friends' : 'Friend')
                .replace(/\{soThanhVien}/g, memLength.join(', '))
                .replace(/\{threadName}/g, threadName);

            // === PNG Attach System ===
            const imgPath = path.join(__dirname, "cache", "wlc.png"); 
            let getImg = (await axios.get("https://i.imgur.com/0445Gzu.png", { responseType: "arraybuffer" })).data; 
            fs.writeFileSync(imgPath, Buffer.from(getImg, "utf-8"));

            return api.sendMessage({
                body: msg,
                mentions,
                attachment: fs.createReadStream(imgPath)
            }, threadID, () => fs.unlinkSync(imgPath)); // কাজ শেষে ফাইল ডিলিট করবে

        } catch (e) { return console.log(e) };
    }
}
