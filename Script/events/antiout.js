module.exports.config = {
 name: "antiout",
 eventType: ["log:unsubscribe"],
 version: "0.0.1",
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
 let data = (await Threads.getData(event.threadID)).data || {};
 if (data.antiout == false) return;
 if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
 const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
 const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "Koi Ase Pichware Mai Lath Marta Hai kya 😂?";
 if (type == "self-separation") {
  api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
   if (error) {
    api.sendMessage(`(╥╯^╰╥) 𝚜𝚘𝚛𝚛𝚢 𝚋𝚘𝚜𝚜, ${name} 𝙺𝙴 𝙰𝙳𝙳 𝙺𝙾𝚁𝚃𝙴 𝙿𝙰𝚁𝙲𝙷𝙸 𝙽𝙰 !
\n  ──────꯭─⃝‌‌⚡ℕ𝔼𝕆𝕏⚡──────`, event.threadID)
   } else api.sendMessage(`𝙰𝙷𝙰𝚁𝙴 𝙰𝙼𝚁, ${name}, 𝚂𝚄𝙽𝙰 𝚃𝚄𝙼𝙸 𝙰𝙸𝙺𝙷𝙰𝙽 𝚃𝙷𝙴𝙺𝙴 𝙹𝙴𝚃𝙴 𝙿𝙰𝚁𝙱𝙰 𝙽𝙰 💀!
𝙰𝙶𝙴 𝙰𝙼𝚁 𝙱𝙾𝚂𝚂 𝙴𝚁 𝙿𝙴𝚁𝙼𝙸𝚂𝚂𝙾𝙽 𝙽𝙴𝙾!🤌
\n─────꯭─⃝‌‌⚡ℕ𝔼𝕆𝕏⚡──────`, event.threadID);
  })
 }
}
