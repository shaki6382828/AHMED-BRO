module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "1.0.2",
  credits: "𝐒𝐡𝐚𝐡𝐚𝐝𝐚𝐭 𝐈𝐬𝐥𝐚𝐦",
  description: "Welcome message with optional image/video",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.onLoad = function () {
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const paths = [
    join(__dirname, "cache", "joinGif"),
    join(__dirname, "cache", "randomgif")
  ];
  for (const path of paths) {
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
  }
};

module.exports.run = async function({ api, event }) {
  const fs = require("fs");
  const path = require("path");
  const { threadID } = event;
  
  const botPrefix = global.config.PREFIX || "/";
  const botName = global.config.BOTNAME || "𝐒𝐈𝐅𝐔 𝐁𝐎𝐓 💮";

 
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    await api.changeNickname(`[ ${botPrefix} ] • ${botName}`, threadID, api.getCurrentUserID());

    api.sendMessage(" 𝙺𝙼𝙽 𝙰𝙲𝙷𝙾 𝚃𝙾𝙼𝚁𝙰 ★~(◡﹏◕✿)", threadID, () => {
      const randomGifPath = path.join(__dirname, "cache", "randomgif");
      const allFiles = fs.readdirSync(randomGifPath).filter(file =>
        [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
      );

      const selected = allFiles.length > 0 
        ? fs.createReadStream(path.join(randomGifPath, allFiles[Math.floor(Math.random() * allFiles.length)])) 
        : null;

      const messageBody = `𝚃𝙷𝙰𝙽𝙺𝚂 𝙵𝙾𝚁 𝙰𝙳𝙳𝙸𝙽𝙶 𝙼𝙴 🫲🏻🐸🫱🏻
      `;

      if (selected) {
        api.sendMessage({ body: messageBody, attachment: selected }, threadID);
      } else {
        api.sendMessage(messageBody, threadID);
      }
    });

    return;
  }

 
  try {
    const { createReadStream, readdirSync } = global.nodemodule["fs-extra"];
    let { threadName, participantIDs } = await api.getThreadInfo(threadID);
    const threadData = global.data.threadData.get(parseInt(threadID)) || {};
    let mentions = [], nameArray = [], memLength = [], i = 0;

    for (let id in event.logMessageData.addedParticipants) {
      const userName = event.logMessageData.addedParticipants[id].fullName;
      nameArray.push(userName);
      mentions.push({ tag: userName, id });
      memLength.push(participantIDs.length - i++);
    }
    memLength.sort((a, b) => a - b);

    let msg = (typeof threadData.customJoin === "undefined") ? `╭•┄┅═══❁♥❁═══┅┄•╮
   আ্ঁস্ঁসা্ঁলা্ঁমু্ঁ💚আ্ঁলা্ঁই্ঁকু্ঁম্ঁ
╰•┄┅═══❁♥❁═══┅┄•╯


➤ আশা করি আপনি এখানে হাসি-মজা করে 
আড্ডা দিতে ভালোবাসবেন।
➤ সবার সাথে মিলেমিশে থাকবেন।😉
➤ উস্কানিমূলক কথা বা খারাপ ব্যবহার করবেন না।🚫
➤ গ্রুপ এডমিনের কথা শুনবেন ও রুলস মেনে চলবেন।✅

›› প্রিয় {name},  \n
আপনি এই গ্রুপের {soThanhVien} নম্বর মেম্বার!

›› গ্রুপ: {threadName}

💌♥ 𝐖 𝐄 𝐋 𝐂 𝐎 𝐌 𝐄 ♥💌
╭─╼╾──╼🌸╾──╼╾──╮
    ❖──♥𝕊𝕀𝔽𝕌 𝔹𝕆𝕋♥──❖
╰──╼╾─╼🌸╾──╼╾──╯

❖⋆══════════════════════════⋆❖` : threadData.customJoin;

    msg = msg
      .replace(/\{name}/g, nameArray.join(', '))
      .replace(/\{soThanhVien}/g, memLength.join(', '))
      .replace(/\{threadName}/g, threadName);

    const joinGifPath = path.join(__dirname, "cache", "joinGif");
    const files = readdirSync(joinGifPath).filter(file =>
      [".mp4", ".jpg", ".png", ".jpeg", ".gif", ".mp3"].some(ext => file.endsWith(ext))
    );
    const randomFile = files.length > 0 
      ? createReadStream(path.join(joinGifPath, files[Math.floor(Math.random() * files.length)])) 
      : null;

    return api.sendMessage(
      randomFile ? { body: msg, attachment: randomFile, mentions } : { body: msg, mentions },
      threadID
    );
  } catch (e) {
    console.error(e);
  }
};
