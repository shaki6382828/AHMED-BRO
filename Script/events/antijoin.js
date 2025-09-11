module.exports.config = {
 name: "antijoin",
 eventType: ["log:subscribe"],
 version: "1.0.0",
 credits: "𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁",
 description: "Welcome new members to the group"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
 	let data = (await Threads.getData(event.threadID)).data
 	if (data.newMember == false) return;
 	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return
    else if(data.newMember == true) {
    var memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId)
			for (let idUser of memJoin) {
					await new Promise(resolve => setTimeout(resolve, 1000));
					api.removeUserFromGroup(idUser, event.threadID, async function (err) {
                        if (err) return data["newMember"] = false;
                            await Threads.setData(event.threadID, { data });
                              global.data.threadData.set(event.threadID, data);
                    })
			}
 	return api.sendMessage(`💢✨ 𝙰𝙽𝚃𝙸 𝙹𝙾𝙸𝙽 𝙼𝙾𝙳𝙴 𝚃𝚄𝚁𝙽𝙴𝙳 𝙾𝙽 😗 \n ✨⚡ 𝙿𝙻𝙴a𝚂𝙴 𝚃𝚄𝚁𝙽 𝙸𝚃 𝙾𝙵𝙵 𝙱𝙴𝙵𝙾𝚁𝙴 𝙰𝙳𝙳𝙸𝙽𝙶 𝙰 𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁 💝`, event.threadID);
 }
}
