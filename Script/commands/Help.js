const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports.config = {
    name: "help",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "SHAHADAT SAHU",
    description: "Shows all commands with details",
    commandCategory: "system",
    usages: "[command name/page number]",
    cooldowns: 5,
    envConfig: {
        autoUnsend: true,
        delayUnsend: 20
    }
};

module.exports.languages = {
    "en": {
        "moduleInfo": `╭━━━━━━━━━━━━━━━━╮
┃ ✨ 𝐒𝐈𝐅𝐔 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 ✨
┣━━━━━━━━━━━┫
┃ 🔖 𝙽𝙰𝙼𝙴: %1
┃ 📄 𝚄𝚂𝙴: %2
┃ 📜 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽: %3
┃ 🔑 𝙿𝙴𝚁𝙼𝙸𝚂𝚂𝙸𝙾𝙽: %4
┃ 👨‍💻 𝙲𝚁𝙴𝙳𝙸𝚃: 𝕊𝕀𝔽𝔸𝕋
┃ 📂 𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈: %6
┃ ⏳ 𝙲𝙾𝙾𝙻𝙳𝙾𝚄𝙽: %7s
┣━━━━━━━━━━━━━━━━┫
┃ ✰ 𝙿𝚁𝙴𝙵𝙸𝚇: %8
┃ ✰ 𝙱𝙾𝚃 𝙽𝙰𝙼𝙴: %9
┃ ✰ 𝙲𝙴𝙾: 𝐒𝐇𝐈𝐅𝐀𝐓
╰━━━━━━━━━━━━━━━━╯`,
        "helpList": "[ There are %1 commands. Use: \"%2help commandName\" to view more. ]",
        "user": "User",
        "adminGroup": "Admin Group",
        "adminBot": "Admin Bot"
    }
};

// এখানে আপনার ফোটো Imgur লিংক করে বসাবেন✅

const helpImages = [
    "https:/i.imgur.com/K2Rgmw6.jpeg"
];

function downloadImages(callback) {
    let files = [];
    let completed = 0;

    helpImages.forEach((url, i) => {  
        let filePath = path.join(__dirname, "cache", `help${i}.jpg`);  
        files.push(filePath);  
        request(url).pipe(fs.createWriteStream(filePath)).on("close", () => {  
            completed++;  
            if (completed === helpImages.length) callback(files);  
        });  
    });
}

module.exports.handleEvent = function ({ api, event, getText }) {
    const { commands } = global.client;
    const { threadID, messageID, body } = event;

    if (!body || typeof body === "undefined" || body.indexOf("help") != 0) return;  
    const splitBody = body.slice(body.indexOf("help")).trim().split(/\s+/);  
    if (splitBody.length < 2 || !commands.has(splitBody[1].toLowerCase())) return;  

    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};  
    const command = commands.get(splitBody[1].toLowerCase());  
    const prefix = threadSetting.PREFIX || global.config.PREFIX;  

    const detail = getText("moduleInfo",  
        command.config.name,  
        command.config.usages || "Not Provided",  
        command.config.description || "Not Provided",  
        command.config.hasPermssion,  
        command.config.credits || "Unknown",  
        command.config.commandCategory || "Unknown",  
        command.config.cooldowns || 0,  
        prefix,  
        global.config.BOTNAME || "𝐒𝐢𝐟𝐮 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭"  
    );  

    downloadImages(files => {  
        const attachments = files.map(f => fs.createReadStream(f));  
        api.sendMessage({ body: detail, attachment: attachments }, threadID, () => {  
            files.forEach(f => fs.unlinkSync(f));  
        }, messageID);  
    });
};

module.exports.run = function ({ api, event, args, getText }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;

    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};  
    const prefix = threadSetting.PREFIX || global.config.PREFIX;  

    if (args[0] && commands.has(args[0].toLowerCase())) {  
        const command = commands.get(args[0].toLowerCase());  

        const detailText = getText("moduleInfo",  
            command.config.name,  
            command.config.usages || "Not Provided",  
            command.config.description || "Not Provided",  
            command.config.hasPermssion,  
            command.config.credits || "Unknown",  
            command.config.commandCategory || "Unknown",  
            command.config.cooldowns || 0,  
            prefix,  
            global.config.BOTNAME || "𝐒𝐢𝐟𝐮 𝐂𝐡𝐚𝐭 𝐁𝐨𝐭"  
        );  

        downloadImages(files => {  
            const attachments = files.map(f => fs.createReadStream(f));  
            api.sendMessage({ body: detailText, attachment: attachments }, threadID, () => {  
                files.forEach(f => fs.unlinkSync(f));  
            }, messageID);  
        });  
        return;  
    }  

    const arrayInfo = Array.from(commands.keys())
        .filter(cmdName => cmdName && cmdName.trim() !== "")
        .sort();  

    const page = Math.max(parseInt(args[0]) || 1, 1);  
    const numberOfOnePage = 20;  
    const totalPages = Math.ceil(arrayInfo.length / numberOfOnePage);  
    const start = numberOfOnePage * (page - 1);  
    const helpView = arrayInfo.slice(start, start + numberOfOnePage);  

    let msg = helpView.map(cmdName => `┃✿➳ ${cmdName} ♡`).join("\n");

    const text = `╭━━━━━━━━━━━━━━━━╮
┃ 📜 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐋𝐈𝐒𝐓 📜
┣━━━━━━━━━━━━━━━┫
┃ 📄 𝙿𝙰𝙶𝙴: ${page}/${totalPages}
┃ 🧮 𝚃𝙾𝚃𝙰𝙻: ${arrayInfo.length}
┣━━━━━━━━━━━━━━━━┫
${msg}
┣━━━━━━━━━━━━━━━━┫
┃ ⚙ 𝙿𝚁𝙴𝙵𝙸𝚇: ${prefix}
┃ 🤖 𝙱𝙾𝚃 𝙽𝙰𝙼𝙴: ${global.config.BOTNAME || "𝐒𝐢𝐟𝐮 𝐁𝐨𝐭"}
┃ 👑 𝙲𝙴𝙾: 𝐒𝐇𝐈𝐅𝐀𝐓
╰━━━━━━━━━━━━━━━━╯`;

    downloadImages(files => {  
        const attachments = files.map(f => fs.createReadStream(f));  
        api.sendMessage({ body: text, attachment: attachments }, threadID, () => {  
            files.forEach(f => fs.unlinkSync(f));  
        }, messageID);  
    });  
};
