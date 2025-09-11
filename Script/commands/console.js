const moment = require("moment-timezone");
const chalk = require("chalk");

module.exports.config = {
    name: "console",
    version: "1.0.0",
    hasPermssion: 3,
    credits: "𝗦𝗛𝗜𝗙𝗔𝗧",
    description: "Make the console more beautiful",
    commandCategory: "system",
    usages: "console",
    cooldowns: 0
};

module.exports.run = async function ({ api, event, Users, Threads }) {
    const { threadID, senderID, body } = event;

    // Time (BD)
    const timeBD = moment.tz("Asia/Dhaka").format("LLLL");

    // Group Info
    const threadData = (await Threads.getData(threadID)).threadInfo || {};
    const threadName = threadData.threadName || "Unnamed Group";

    // User Info
    const userName = await Users.getNameUser(senderID);

    // Random colors
    const colors = [
        "FF3366", "FF99FF", "00CCFF", "66FF99", "FF9900",
        "FF5B00", "33FFFF", "7F5283", "CFFFDC", "47B5FF"
    ];
    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    // Print in console
    console.log(
        chalk.hex(`#${pick()}`)(`[🔎]→ Group: ${threadName}\n`) +
        chalk.hex(`#${pick()}`)(`[💓]→ Group ID: ${threadID}\n`) +
        chalk.hex(`#${pick()}`)(`[📝]→ User: ${userName}\n`) +
        chalk.hex(`#${pick()}`)(`[🔱]→ User ID: ${senderID}\n`) +
        chalk.hex(`#${pick()}`)(`[📩]→ Content: ${body || "Empty"}\n`) +
        chalk.hex(`#${pick()}`)(`[⏰]→ Time: [ ${timeBD} ]\n`) +
        chalk.hex(`#${pick()}`)("◆━━━━━━𝕊𝕀𝔽𝔸𝕋━━━━━━◆")
    );
};

module.exports.handleEvent = async function ({ api, event, Threads, getText }) {
    const { threadID, messageID } = event;
    let data = (await Threads.getData(threadID)).data;

    if (typeof data.console == "undefined" || data.console === true) {
        data.console = false;
    } else {
        data.console = true;
    }

    await Threads.setData(threadID, { data });
    global.data.threadData.set(threadID, data);

    api.sendMessage(
        `${data.console ? "console OFF" : "console ON"} → ${getText("successText")}`,
        threadID,
        messageID
    );
};

module.exports.languages = {
    vi: {
        on: "Bật",
        off: "Tắt",
        successText: "console thành công"
    },
    en: {
        on: "on",
        off: "off",
        successText: "console success!"
    }
};
