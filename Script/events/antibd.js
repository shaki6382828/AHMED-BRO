module.exports.config = {
  name: "antibd",
  eventType: ["log:user-nickname"],
  version: "0.0.1",
  credits: "𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁",
  description: "Against changing Bot's nickname"
};

module.exports.run = async function({ api, event, Users, Threads }) {
    var { logMessageData, threadID, author } = event;
    var botID = api.getCurrentUserID();
    var { BOTNAME, ADMINBOT } = global.config;
    var { nickname } = await Threads.getData(threadID, botID);
    var nickname = nickname ? nickname : BOTNAME;
    if (logMessageData.participant_id == botID && author != botID && !ADMINBOT.includes(author) && logMessageData.nickname != nickname) {
        api.changeNickname(nickname, threadID, botID)
        var info = await Users.getData(author);
       return api.sendMessage({ body: `${info.name} - 𝚈𝙾𝚄 𝙲𝙰𝙽'𝚃 𝙲𝙷𝙰𝙽𝙶𝙴 𝙼𝚈 𝙽𝙸𝙲𝙺𝙽𝙰𝙼𝙴 🙎🏻\n ──────꯭─⃝‌‌𝐒𝐡𝐢𝐟𝐚𝐭 𝐒𝐢𝐟𝐮 𝐁𝐨𝐭───── `}, threadID);
    }  
        }
